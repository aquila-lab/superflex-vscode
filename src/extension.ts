import * as vscode from 'vscode'

import {
  EventRequestType,
  EventResponseType,
  newEventRequest,
  newEventResponse
} from '../shared/protocol'
import FigmaAuthenticationProvider from './authentication/FigmaAuthenticationProvider'
import FigmaAuthenticationService from './authentication/FigmaAuthenticationService'
import SuperflexAuthenticationProvider from './authentication/SuperflexAuthenticationProvider'
import SuperflexAuthenticationService from './authentication/SuperflexAuthenticationService'
import { SuperflexCache } from './cache/SuperflexCache'
import { ChatAPI } from './chat/ChatApi'
import ChatViewProvider from './chat/ChatViewProvider'
import registerChatWidgetWebview from './chat/chatWidgetWebview'
import uriEventHandler from './common/UriEventHandler'
import { Telemetry } from './common/analytics/Telemetry'
import {
  AUTH_PROVIDER_ID,
  FIGMA_PROVIDER_ID,
  SUPERFLEX_POSTHOG_API_KEY
} from './common/constants'
import {
  getExtensionVersion,
  getOpenWorkspace,
  getUniqueID
} from './common/utils'
import { VerticalDiffManager } from './diff/vertical/manager'
import { registerAllCodeLensProviders } from './lang-server/codeLens/registerAllCodeLensProviders'

type AppState = {
  verticalDiffManager: VerticalDiffManager
  chatApi: ChatAPI
  authService: SuperflexAuthenticationService
  authProvider: SuperflexAuthenticationProvider
  figmaAuthService: FigmaAuthenticationService
  figmaAuthProvider: FigmaAuthenticationProvider
  chatViewProvider: ChatViewProvider
  projectSyncInterval?: NodeJS.Timeout
}

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const verticalDiffManager = new VerticalDiffManager()
  const chatApi = new ChatAPI(verticalDiffManager)
  const chatWebviewProvider = new ChatViewProvider(context, chatApi)
  const authService = new SuperflexAuthenticationService(chatWebviewProvider)
  const figmaAuthProvider = new FigmaAuthenticationProvider(context)

  const appState: AppState = {
    verticalDiffManager: verticalDiffManager,
    chatApi: chatApi,
    authService: authService,
    authProvider: new SuperflexAuthenticationProvider(context, authService),
    figmaAuthService: new FigmaAuthenticationService(
      chatWebviewProvider,
      figmaAuthProvider
    ),
    figmaAuthProvider: figmaAuthProvider,
    chatViewProvider: chatWebviewProvider
  }

  await configureExtension(context, appState)

  // Do not await on this function as we do not want VSCode to wait for it to finish
  // before considering Superflex ready to operate.
  backgroundInit(context, appState)

  Telemetry.capture('extension_activated', {})
  return Promise.resolve()
}

async function backgroundInit(
  context: vscode.ExtensionContext,
  appState: AppState
) {
  vscode.window.registerUriHandler(uriEventHandler)

  registerSuperflexCache(context)
  registerAuthenticationProviders(context, appState)
  registerChatWidgetWebview(context, appState.chatViewProvider)

  const { verticalDiffCodeLens } = registerAllCodeLensProviders(
    context,
    appState.verticalDiffManager.fileUriToCodeLens
  )
  appState.verticalDiffManager.refreshCodeLens =
    verticalDiffCodeLens.refresh.bind(verticalDiffCodeLens)

  appState.chatApi.registerEvent(
    EventRequestType.SEND_NOTIFICATION,
    payload => {
      vscode.window.showInformationMessage(payload.message)
    }
  )
  appState.chatApi.registerEvent(
    EventRequestType.OPEN_EXTERNAL_URL,
    payload => {
      vscode.env.openExternal(vscode.Uri.parse(payload.url))
    }
  )

  const ENHANCE_PROMPT_STATE_KEY = 'enhancePromptState'
  appState.chatApi.registerEvent(
    EventRequestType.GET_ENHANCE_PROMPT_STATE,
    async () => {
      // Default to true if the setting hasn't been set yet
      return context.globalState.get<boolean>(ENHANCE_PROMPT_STATE_KEY, true)
    }
  )
  appState.chatApi.registerEvent(
    EventRequestType.SET_ENHANCE_PROMPT_STATE,
    async (payload: { enabled: boolean }) => {
      await context.globalState.update(
        ENHANCE_PROMPT_STATE_KEY,
        payload.enabled
      )
      return payload.enabled
    }
  )

  // Store the interval ID in appState
  appState.projectSyncInterval = setInterval(
    () =>
      appState.chatViewProvider.handleEventMessage(
        newEventRequest(EventRequestType.SYNC_PROJECT)
      ),
    5 * 60 * 1000 // 5 minutes
  )
}

function registerSuperflexCache(context: vscode.ExtensionContext): void {
  SuperflexCache.setStoragePath(context.storageUri)
  SuperflexCache.setGlobalStoragePath(context.globalStorageUri)

  const openWorkspace = getOpenWorkspace()
  if (openWorkspace) {
    SuperflexCache.setWorkspaceFolderPath(openWorkspace.uri)
  }
}

async function registerAuthenticationProviders(
  context: vscode.ExtensionContext,
  state: AppState
): Promise<void> {
  context.subscriptions.push(state.authProvider)
  context.subscriptions.push(state.figmaAuthProvider)

  context.subscriptions.push(
    // Superflex Auth commands
    vscode.commands.registerCommand(`${AUTH_PROVIDER_ID}.signin`, () =>
      state.authService.signIn(state.authProvider)
    ),
    vscode.commands.registerCommand(`${AUTH_PROVIDER_ID}.signout`, () =>
      state.authService.signOut(state.authProvider)
    ),

    // Figma Auth commands
    vscode.commands.registerCommand(`${FIGMA_PROVIDER_ID}.connect`, () =>
      state.figmaAuthService.connect()
    ),
    vscode.commands.registerCommand(`${FIGMA_PROVIDER_ID}.disconnect`, () =>
      state.figmaAuthService.disconnect(state.figmaAuthProvider)
    )
  )

  state.chatApi.registerEvent(EventRequestType.SIGN_IN, async () => {
    await state.authService.signIn(state.authProvider)
  })
  state.chatApi.registerEvent(EventRequestType.SIGN_OUT, async () => {
    await state.authService.signOut(state.authProvider)
  })

  state.chatApi.registerEvent(EventRequestType.CREATE_ACCOUNT, async () => {
    await state.authService.signIn(state.authProvider, true)
  })
  state.chatApi.registerEvent(
    EventRequestType.CREATE_AUTH_LINK,
    async payload => {
      const { uri } = await state.authProvider.createAuthUniqueLink(
        payload.action === 'create_account'
      )
      await state.authProvider.waitForUserConsentToLogin()
      return { uniqueLink: uri.toString(true) }
    }
  )

  state.chatApi.registerEvent(
    EventRequestType.FIGMA_OAUTH_CONNECT,
    async () => {
      const token = await state.figmaAuthService.connect()
      return !!token && !!token.accessToken
    }
  )
  state.chatApi.registerEvent(
    EventRequestType.FIGMA_OAUTH_DISCONNECT,
    async () => {
      await state.figmaAuthService.disconnect(state.figmaAuthProvider)
    }
  )

  state.authService.authenticate(state.authProvider)
  state.figmaAuthService.authenticate(state.figmaAuthProvider)
}

async function configureExtension(
  context: vscode.ExtensionContext,
  appState: AppState
) {
  const config = vscode.workspace.getConfiguration('superflex')
  const analyticsEnabled = config.get<boolean>('analytics', false)

  appState.chatViewProvider.sendEventMessage(
    newEventResponse(EventResponseType.CONFIG, {
      uriScheme: vscode.env.uriScheme,
      allowAnonymousTelemetry: analyticsEnabled
    })
  )

  if (analyticsEnabled && SUPERFLEX_POSTHOG_API_KEY) {
    const { uniqueID, isNew } = getUniqueID(context)
    const extensionVersion = getExtensionVersion()

    await Telemetry.setup(analyticsEnabled, uniqueID, extensionVersion, {
      clientKey: SUPERFLEX_POSTHOG_API_KEY,
      url: 'https://app.posthog.com'
    })

    if (isNew) {
      Telemetry.capture('new_anon_user', {})
    }
  }
}

// This method is called when your extension is deactivated
export function deactivate(appState?: AppState) {
  if (appState?.projectSyncInterval) {
    clearInterval(appState.projectSyncInterval)
  }
}
