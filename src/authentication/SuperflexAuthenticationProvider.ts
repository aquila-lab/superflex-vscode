import { v4 as uuidv4 } from "uuid";
import {
  authentication,
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  Disposable,
  EventEmitter,
  ExtensionContext,
  window,
  env,
  Uri,
  ProgressLocation,
} from "vscode";

import { User } from "shared/model";
import * as api from "../api";
import { APP_BASE_URL, AUTH_PROVIDER_ID } from "../common/constants";
import { PromiseAdapter, promiseFromEvent } from "../adapters/promiseFromEvent";
import AuthService from "./SuperflexAuthenticationService";
import uriEventHandler, { UriEventHandler } from "./UriEventHandler";

const AUTH_PROVIDER_LABEL = "Superflex Authentication";
const SESSIONS_SECRET_KEY = `${AUTH_PROVIDER_ID}.sessions`;

let remoteOutput = window.createOutputChannel(AUTH_PROVIDER_ID);

interface TokenInformation {
  accessToken: string;
}

export default class SuperflexAuthenticationProvider implements AuthenticationProvider, Disposable {
  private _disposable: Disposable;
  private _pendingStates: string[] = [];
  private _uriHandler: UriEventHandler;
  private _sessionChangeEmitter = new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  private _codeExchangePromises = new Map<string, { promise: Promise<TokenInformation>; cancel: EventEmitter<void> }>();
  private _authService: AuthService;

  constructor(private readonly context: ExtensionContext, authService: AuthService) {
    this._authService = authService;
    this._uriHandler = uriEventHandler;

    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(AUTH_PROVIDER_ID, AUTH_PROVIDER_LABEL, this, {
        supportsMultipleAccounts: false,
      }),
      window.registerUriHandler(this._uriHandler) // Register the URI handler
    );
  }

  get onDidChangeSessions() {
    return this._sessionChangeEmitter.event;
  }

  get redirectUri() {
    const publisher = this.context.extension.packageJSON.publisher;
    const name = this.context.extension.packageJSON.name;
    return `${env.uriScheme}://${publisher}.${name}`;
  }

  public async getSessions(): Promise<readonly AuthenticationSession[]> {
    const allSessions = await this.context.secrets.get(SESSIONS_SECRET_KEY);
    if (!allSessions) {
      return [];
    }
    return JSON.parse(allSessions) as AuthenticationSession[];
  }

  public async createSession(): Promise<AuthenticationSession> {
    try {
      const { accessToken } = await this.login();
      if (!accessToken) {
        throw new Error("Superflex - Auth login failure");
      }

      this._authService.authenticate(this, accessToken);

      const user: User = await api.getUserInfo();

      const session: AuthenticationSession = {
        id: uuidv4(),
        accessToken: accessToken,
        account: {
          id: user.id,
          label: user.email,
        },
        scopes: [],
      };

      await this.context.secrets.store(SESSIONS_SECRET_KEY, JSON.stringify([session]));

      this._sessionChangeEmitter.fire({ added: [session], removed: [], changed: [] });

      return session;
    } catch (err) {
      window.showErrorMessage(`Sign in failed: ${err}`);
      throw err;
    }
  }

  public async removeSession(sessionId: string): Promise<void> {
    const allSessions = await this.context.secrets.get(SESSIONS_SECRET_KEY);
    if (allSessions) {
      let sessions = JSON.parse(allSessions) as AuthenticationSession[];
      const sessionIdx = sessions.findIndex((s) => s.id === sessionId);
      const session = sessions[sessionIdx];
      sessions.splice(sessionIdx, 1);

      await this.context.secrets.store(SESSIONS_SECRET_KEY, JSON.stringify(sessions));

      if (session) {
        this._sessionChangeEmitter.fire({ added: [], removed: [session], changed: [] });
      }
    }
  }

  public async dispose() {
    this._disposable.dispose();
  }

  private async login(): Promise<TokenInformation> {
    return await window.withProgress<TokenInformation>(
      {
        location: ProgressLocation.Notification,
        title: "Signing in to Superflex...",
        cancellable: true,
      },
      async (_, token) => {
        let callbackUri = await env.asExternalUri(Uri.parse(this.redirectUri));

        remoteOutput.appendLine(`Callback URI: ${callbackUri.toString(true)}`);

        const callbackQuery = new URLSearchParams(callbackUri.query);

        const nonceID = uuidv4();
        const stateID = callbackQuery.get("state") || nonceID;

        remoteOutput.appendLine(`State ID: ${stateID}`);
        remoteOutput.appendLine(`Nonce ID: ${nonceID}`);

        callbackQuery.set("state", encodeURIComponent(stateID));
        callbackQuery.set("nonce", encodeURIComponent(nonceID));
        callbackUri = callbackUri.with({
          query: callbackQuery.toString(),
        });

        this._pendingStates.push(stateID);

        const searchParams = new URLSearchParams([["state", encodeURIComponent(callbackUri.toString(true))]]);
        const uri = Uri.parse(`${APP_BASE_URL}/login?${searchParams.toString()}`);

        remoteOutput.appendLine(`Login URI: ${uri.toString(true)}`);

        await env.openExternal(uri);

        let codeExchangePromise = this._codeExchangePromises.get(stateID);
        if (!codeExchangePromise) {
          codeExchangePromise = promiseFromEvent(this._uriHandler.event, this.handleUri());
          this._codeExchangePromises.set(stateID, codeExchangePromise);
        }

        try {
          return await Promise.race([
            codeExchangePromise.promise,
            new Promise<string>((_, reject) => setTimeout(() => reject("Cancelled"), 60000)),
            promiseFromEvent<any, any>(token.onCancellationRequested, (_, __, reject) => {
              reject("User Cancelled");
            }).promise,
          ]);
        } finally {
          this._pendingStates = this._pendingStates.filter((n) => n !== stateID);
          codeExchangePromise?.cancel.fire();
          this._codeExchangePromises.delete(stateID);
        }
      }
    );
  }

  /**
   * Handle the redirect to VS Code (after sign in from Superflex Auth page)
   */
  private handleUri: () => PromiseAdapter<Uri, TokenInformation> = () => async (uri, resolve, reject) => {
    const query = new URLSearchParams(uri.query);
    const accessToken = query.get("access_token");

    if (!accessToken) {
      reject(new Error("No access token"));
      return;
    }

    resolve({ accessToken });
  };
}
