import * as vscode from "vscode";
import { AuthenticationProvider } from "vscode";

import { EventType, newEventResponse } from "../../shared/protocol";
import { ApiProvider } from "../api";
import ChatViewProvider from "../chat/ChatViewProvider";
import { Telemetry } from "../common/analytics/Telemetry";
import { ApiErrorTypes, AUTH_PROVIDER_ID } from "../common/constants";

export default class SuperflexAuthenticationService {
  private _webviewProvider: ChatViewProvider;

  constructor(webviewProvider: ChatViewProvider) {
    this._webviewProvider = webviewProvider;
  }

  /**
   * Command to sign in the user.
   */
  async signIn(provider: AuthenticationProvider): Promise<void> {
    Telemetry.capture("signin_started", {});

    const session = await vscode.authentication.getSession(AUTH_PROVIDER_ID, [], { createIfNone: true });

    this.setAuthHeader(session.accessToken, () => this.signOut(provider));

    vscode.window.showInformationMessage(`Signed in as ${session.account.label} 🎉`);

    Telemetry.capture("signin_succeeded", {
      userID: session.account.id,
      email: session.account.label,
    });
  }

  /**
   * Command to sign out the user.
   */
  async signOut(provider: AuthenticationProvider): Promise<void> {
    Telemetry.capture("signout_started", {});

    const session = await vscode.authentication.getSession(AUTH_PROVIDER_ID, [], { createIfNone: false });
    if (session) {
      await provider.removeSession(session.id);
    }

    ApiProvider.setHeader("Authorization", null);
    ApiProvider.removeResponseInterceptor();

    this._webviewProvider.sendEventMessage(newEventResponse(EventType.SHOW_LOGIN_VIEW));

    vscode.commands.executeCommand("setContext", "superflex.chat.authenticated", false);
    vscode.window.showInformationMessage("Signed out!");

    const fields: Record<string, string> = {};
    if (session) {
      fields.userID = session.account.id;
      fields.email = session.account.label;
    }

    Telemetry.capture("signout_succeeded", fields);
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

    this._webviewProvider.sendEventMessage(newEventResponse(EventType.SHOW_CHAT_VIEW));
    vscode.commands.executeCommand("setContext", "superflex.chat.authenticated", true);
  }

  private async setAuthHeader(token: string, logoutAction: any): Promise<void> {
    try {
      ApiProvider.setHeader("Authorization", `Bearer ${token}`);
      ApiProvider.addHeaderTokenInterceptor(async (err) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
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
