import axios from "axios";
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
  UriHandler,
  ProgressLocation,
} from "vscode";

import { API_BASE_URL, APP_BASE_URL, BRAND_NAME } from "../utils/consts";
import { PromiseAdapter, promiseFromEvent } from "../adapters/promiseFromEvent";

const AUTH_TYPE = `${BRAND_NAME}-auth`;
const AUTH_NAME = "Element AI Authentication";
const SESSIONS_SECRET_KEY = `${AUTH_TYPE}.sessions`;

let remoteOutput = window.createOutputChannel(AUTH_TYPE);

interface UserInfo {
  id: string;
  email: string;
}

interface TokenInformation {
  accessToken: string;
  refreshToken: string | null;
}

interface ElementAIAuthenticationSession extends AuthenticationSession {
  refreshToken: string | null;
}

class UriEventHandler extends EventEmitter<Uri> implements UriHandler {
  public handleUri(uri: Uri) {
    this.fire(uri);
  }
}

export default class ElementAIAuthenticationProvider implements AuthenticationProvider, Disposable {
  private _disposable: Disposable;
  private _pendingStates: string[] = [];
  private _uriHandler = new UriEventHandler();
  private _sessionChangeEmitter = new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  private _codeExchangePromises = new Map<string, { promise: Promise<TokenInformation>; cancel: EventEmitter<void> }>();

  constructor(private readonly context: ExtensionContext) {
    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(AUTH_TYPE, AUTH_NAME, this, { supportsMultipleAccounts: false }),
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

  public async getSessions(): Promise<readonly ElementAIAuthenticationSession[]> {
    try {
      const allSessions = await this.context.secrets.get(SESSIONS_SECRET_KEY);
      if (!allSessions) {
        return [];
      }

      const sessions = JSON.parse(allSessions) as ElementAIAuthenticationSession[];
      if (sessions.length > 0) {
        const session = sessions[0];

        const tokenExpired = await this.isTokenExpired(session.accessToken);

        if (tokenExpired && session && session.refreshToken) {
          const refreshToken = session.refreshToken;
          const { accessToken } = await this.getAccessToken(session.account.id, refreshToken);

          if (accessToken) {
            const updatedSession = Object.assign({}, session, { accessToken: accessToken, scopes: [] });
            return [updatedSession];
          }

          this.removeSession(session.id);
          return [];
        }

        return [session];
      }
    } catch (e) {
      // Nothing to do
    }

    return [];
  }

  public async createSession(): Promise<AuthenticationSession> {
    try {
      const { accessToken, refreshToken } = await this.login();
      if (!accessToken) {
        throw new Error("Element AI - Auth login failure");
      }

      const userinfo: UserInfo = await this.getUserInfo(accessToken);

      const session: ElementAIAuthenticationSession = {
        id: uuidv4(),
        accessToken: accessToken,
        refreshToken: refreshToken,
        account: {
          id: userinfo.id,
          label: userinfo.email,
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
        title: "Signing in to Element AI...",
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
        const uri = Uri.parse(`${APP_BASE_URL}/element-ai/auth?${searchParams.toString()}`);

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
   * Handle the redirect to VS Code (after sign in from Element AI Auth page)
   */
  private handleUri: () => PromiseAdapter<Uri, TokenInformation> = () => async (uri, resolve, reject) => {
    const query = new URLSearchParams(uri.query);
    const accessToken = query.get("access_token");
    const refreshToken = query.get("refresh_token");

    console.log(`Access token handleUri: ${query}`);

    if (!accessToken) {
      reject(new Error("No access token"));
      return;
    }

    resolve({
      accessToken,
      refreshToken,
    });
  };

  /**
   * Retrieve a new access token by the refresh token
   */
  private async getAccessToken(accountID: string, refreshToken: string): Promise<TokenInformation> {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        body: {
          user_id: accountID,
          refresh_token: refreshToken,
        },
      });

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      };
    } catch (err) {
      return {
        accessToken: "",
        refreshToken: null,
      };
    }
  }

  private async getUserInfo(token: string): Promise<UserInfo> {
    const { data } = await axios.get(`${API_BASE_URL}/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      id: data.id,
      email: data.email,
    };
  }

  private async isTokenExpired(token: string): Promise<boolean> {
    try {
      await this.getUserInfo(token);
      return false;
    } catch (err) {
      return true;
    }
  }
}
