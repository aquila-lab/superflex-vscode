import { v4 as uuidv4 } from 'uuid'
import {
  type AuthenticationProvider,
  type AuthenticationProviderAuthenticationSessionsChangeEvent,
  type AuthenticationSession,
  Disposable,
  EventEmitter,
  type ExtensionContext,
  ProgressLocation,
  Uri,
  authentication,
  env,
  window
} from 'vscode'

import type { FigmaTokenInformation, User } from '../../shared/model'
import {
  type PromiseAdapter,
  promiseFromEvent
} from '../adapters/promiseFromEvent'
import * as api from '../api'
import {
  FIGMA_AUTH_PROVIDER_ID,
  FIGMA_OAUTH_CALLBACK_URL,
  FIGMA_OAUTH_CLIENT_ID
} from '../common/constants'
import uriEventHandler, {
  type UriEventHandler
} from '../common/UriEventHandler'

const AUTH_PROVIDER_LABEL = 'Figma Authentication'
const SESSIONS_SECRET_KEY = `${FIGMA_AUTH_PROVIDER_ID}.sessions`

const remoteOutput = window.createOutputChannel(FIGMA_AUTH_PROVIDER_ID)

export interface FigmaAuthenticationSession extends AuthenticationSession {
  refreshToken: string
}

export default class FigmaAuthenticationProvider
  implements AuthenticationProvider, Disposable
{
  private _disposable: Disposable
  private _pendingStates: string[] = []
  private _uriHandler: UriEventHandler
  private _sessionChangeEmitter =
    new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>()
  private _codeExchangePromises = new Map<
    string,
    { promise: Promise<FigmaTokenInformation>; cancel: EventEmitter<void> }
  >()

  constructor(private readonly context: ExtensionContext) {
    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(
        FIGMA_AUTH_PROVIDER_ID,
        AUTH_PROVIDER_LABEL,
        this,
        {
          supportsMultipleAccounts: false
        }
      )
    )
    this._uriHandler = uriEventHandler
  }

  get onDidChangeSessions() {
    return this._sessionChangeEmitter.event
  }

  get redirectUri() {
    const publisher = this.context.extension.packageJSON.publisher
    const name = this.context.extension.packageJSON.name
    return `${env.uriScheme}://${publisher}.${name}`
  }

  public async getSessions(): Promise<FigmaAuthenticationSession[]> {
    const allSessions = await this.context.secrets.get(SESSIONS_SECRET_KEY)
    if (!allSessions) {
      return []
    }
    return JSON.parse(allSessions) as FigmaAuthenticationSession[]
  }

  public async createSession(): Promise<FigmaAuthenticationSession> {
    try {
      const { accessToken, refreshToken } = await this.login()
      if (!accessToken) {
        throw new Error('Superflex - (Figma): Connecting Figma account failed!')
      }

      api.ApiProvider.setHeader('X-Figma-Token', accessToken)
      api.FigmaApiProvider.setHeader('Authorization', `Bearer ${accessToken}`)
      const user: User = await api.getFigmaUserInfo()

      const session: FigmaAuthenticationSession = {
        id: uuidv4(),
        accessToken: accessToken,
        refreshToken: refreshToken,
        account: {
          id: user.id,
          label: user.email
        },
        scopes: []
      }

      await this.context.secrets.store(
        SESSIONS_SECRET_KEY,
        JSON.stringify([session])
      )

      this._sessionChangeEmitter.fire({
        added: [session],
        removed: [],
        changed: []
      })

      return session
    } catch (err) {
      window.showErrorMessage(
        `Superflex - (Figma): Connecting Figma account failed: ${err}`
      )
      throw err
    }
  }

  public async updateSession(
    sessionId: string,
    tokenInfo: FigmaTokenInformation
  ): Promise<FigmaAuthenticationSession> {
    const allSessions = await this.context.secrets.get(SESSIONS_SECRET_KEY)
    if (!allSessions) {
      throw new Error('Session not found')
    }

    const sessions = JSON.parse(allSessions) as FigmaAuthenticationSession[]
    const sessionIdx = sessions.findIndex(s => s.id === sessionId)
    if (sessionIdx === -1) {
      throw new Error('Session not found')
    }

    const session = sessions[sessionIdx]
    sessions.splice(sessionIdx, 1)

    const updatedSession: FigmaAuthenticationSession = {
      ...session,
      accessToken: tokenInfo.accessToken,
      refreshToken: tokenInfo.refreshToken
    }

    await this.context.secrets.store(
      SESSIONS_SECRET_KEY,
      JSON.stringify([updatedSession])
    )

    this._sessionChangeEmitter.fire({
      added: [],
      removed: [],
      changed: [updatedSession]
    })

    return updatedSession
  }

  public async removeSession(sessionId: string): Promise<void> {
    const allSessions = await this.context.secrets.get(SESSIONS_SECRET_KEY)
    if (allSessions) {
      const sessions = JSON.parse(allSessions) as FigmaAuthenticationSession[]
      const sessionIdx = sessions.findIndex(s => s.id === sessionId)
      const session = sessions[sessionIdx]
      sessions.splice(sessionIdx, 1)

      await this.context.secrets.store(
        SESSIONS_SECRET_KEY,
        JSON.stringify(sessions)
      )

      if (session) {
        this._sessionChangeEmitter.fire({
          added: [],
          removed: [session],
          changed: []
        })
      }
    }
  }

  public async dispose() {
    this._disposable.dispose()
  }

  private async login(): Promise<FigmaTokenInformation> {
    return await window.withProgress<FigmaTokenInformation>(
      {
        location: ProgressLocation.Notification,
        title: 'Connecting Superflex with Figma account...',
        cancellable: true
      },
      async (_, token) => {
        let callbackUri = await env.asExternalUri(Uri.parse(this.redirectUri))

        remoteOutput.appendLine(`Callback URI: ${callbackUri.toString(true)}`)

        const callbackQuery = new URLSearchParams(callbackUri.query)

        const nonceID = uuidv4()
        const stateID = callbackQuery.get('state') || nonceID

        remoteOutput.appendLine(`State ID: ${stateID}`)
        remoteOutput.appendLine(`Nonce ID: ${nonceID}`)

        callbackQuery.set('state', encodeURIComponent(stateID))
        callbackQuery.set('nonce', encodeURIComponent(nonceID))
        callbackUri = callbackUri.with({
          query: callbackQuery.toString()
        })

        this._pendingStates.push(stateID)

        const searchParams = new URLSearchParams([
          ['client_id', FIGMA_OAUTH_CLIENT_ID],
          ['redirect_uri', FIGMA_OAUTH_CALLBACK_URL],
          ['scope', 'files:read,file_variables:read,file_dev_resources:read'],
          ['state', encodeURIComponent(callbackUri.toString(true))],
          ['response_type', 'code']
        ])

        const uri = Uri.parse(
          `https://www.figma.com/oauth?${searchParams.toString()}`
        )

        remoteOutput.appendLine(`Login URI: ${uri.toString(true)}`)

        await env.openExternal(uri)

        let codeExchangePromise = this._codeExchangePromises.get(stateID)
        if (!codeExchangePromise) {
          codeExchangePromise = promiseFromEvent(
            this._uriHandler.event,
            this.handleUri()
          )
          this._codeExchangePromises.set(stateID, codeExchangePromise)
        }

        try {
          return await Promise.race([
            codeExchangePromise.promise,
            new Promise<string>((_, reject) =>
              setTimeout(() => reject('Cancelled'), 5 * 60 * 1000)
            ), // 5 minutes
            promiseFromEvent<any, any>(
              token.onCancellationRequested,
              (_, __, reject) => {
                reject('User Cancelled')
              }
            ).promise
          ])
        } finally {
          this._pendingStates = this._pendingStates.filter(n => n !== stateID)
          codeExchangePromise?.cancel.fire()
          this._codeExchangePromises.delete(stateID)
        }
      }
    )
  }

  /**
   * Handle the redirect to VS Code (after sign in from Figma Auth page)
   */
  private handleUri: () => PromiseAdapter<Uri, FigmaTokenInformation> =
    () => async (uri, resolve, reject) => {
      const query = new URLSearchParams(uri.query)
      const accessToken = query.get('access_token')
      const refreshToken = query.get('refresh_token')

      if (!(accessToken && refreshToken)) {
        reject(new Error('No access token'))
        return
      }

      resolve({ accessToken, refreshToken })
    }
}
