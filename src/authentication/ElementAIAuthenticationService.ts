import * as vscode from "vscode";
import { AuthenticationProvider } from "vscode";

import { ApiProvider } from "../api";
import { newEventMessage } from "../protocol";
import { ApiErrorTypes, AUTH_PROVIDER_ID } from "../common/constants";
import ChatViewProvider from "../chat/ChatViewProvider";
import { AIProvider, SelfHostedAIProvider } from "../providers/AIProvider";

export default class ElementAIAuthenticationService {
  private _webviewProvider: ChatViewProvider;
  private _aiProvider: AIProvider;

  constructor(webviewProvider: ChatViewProvider, aiProvider: AIProvider) {
    this._webviewProvider = webviewProvider;
    this._aiProvider = aiProvider;
  }

  /**
   * Command to sign in the user.
   */
  async signIn(provider: AuthenticationProvider): Promise<void> {
    const session = await vscode.authentication.getSession(AUTH_PROVIDER_ID, [], { createIfNone: true });

    this.setAuthHeader(session.accessToken, () => this.signOut(provider));

    vscode.window.showInformationMessage(`Signed in as ${session.account.label} 🎉`);
  }

  /**
   * Command to sign out the user.
   */
  async signOut(provider: AuthenticationProvider): Promise<void> {
    const session = await vscode.authentication.getSession(AUTH_PROVIDER_ID, [], { createIfNone: false });
    if (session) {
      await provider.removeSession(session.id);
    }

    ApiProvider.setHeader("Authorization", null);
    ApiProvider.removeResponseInterceptor();

    this._webviewProvider.sendEventMessage(newEventMessage("show_login_view"));

    vscode.commands.executeCommand("setContext", "elementai.chat.authenticated", false);
    vscode.window.showInformationMessage("Signed out!");
  }

  /**
   * We need to authenticate the user on extension activation to ensure that the user is authenticated before making any API calls.
   */
  async authenticate(provider: AuthenticationProvider, accessToken?: string): Promise<void> {
    if (!accessToken) {
      const session = await vscode.authentication.getSession(AUTH_PROVIDER_ID, [], { createIfNone: false });
      if (!session) {
        return;
      }

      accessToken = session.accessToken;
    }

    this.setAuthHeader(accessToken, () => this.signOut(provider));
    await this.authenticateToken();
  }

  async authenticateToken(): Promise<void> {
    if (this._aiProvider.discriminator === "self-hosted-ai-provider") {
      const selfHostedProvider = this._aiProvider as SelfHostedAIProvider;
      const token = await selfHostedProvider.getToken();
      if (!token) {
        this.removeToken();
        return;
      }

      try {
        this._aiProvider.init();
      } catch (err) {
        this.removeToken();
        vscode.window.showErrorMessage((err as Error).message);
        return;
      }
    }

    this._webviewProvider.sendEventMessage(newEventMessage("show_chat_view"));
    vscode.commands.executeCommand("setContext", "elementai.chat.authenticated", true);
  }

  removeToken(): void {
    if (this._aiProvider.discriminator !== "self-hosted-ai-provider") {
      return;
    }

    const selfHostedProvider = this._aiProvider as SelfHostedAIProvider;
    selfHostedProvider.removeToken();
    vscode.commands.executeCommand("setContext", "elementai.chat.authenticated", false);
    this._webviewProvider.sendEventMessage(newEventMessage("show_enter_token_view"));
  }

  private async setAuthHeader(token: string, logoutAction: any): Promise<void> {
    try {
      ApiProvider.setHeader("Authorization", `Bearer ${token}`);
      ApiProvider.addHeaderTokenInterceptor(async (err) => {
        if (err?.response?.status === 401) {
          this.handleUnauthorizedResponse(err.response, logoutAction);
        }
        return Promise.reject(err);
      });

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  private handleUnauthorizedResponse(response: any, logoutAction: any): void {
    const { slug, message } = response.data.error;

    const shouldLogoutError = [ApiErrorTypes.SESSION_EXPIRED, ApiErrorTypes.SESSION_LIMIT_EXCEEDED].includes(slug);

    let logoutMessage = null;
    if (shouldLogoutError) {
      logoutMessage = message;
    }
    if (logoutMessage) {
      vscode.window.showErrorMessage(logoutMessage);
    }

    logoutAction();
  }
}
