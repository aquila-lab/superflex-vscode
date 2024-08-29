import axios from "axios";
import * as vscode from "vscode";

import { newEventMessage } from "../protocol";
import { FIGMA_AUTH_PROVIDER_ID } from "../common/constants";
import { FigmaTokenInformation } from "../core/Figma.model";
import ChatViewProvider from "../chat/ChatViewProvider";
import FigmaAuthenticationProvider, { FigmaAuthenticationSession } from "./FigmaAuthenticationProvider";
import { FigmaApiProvider, figmaRefreshAccessToken } from "../api";

export default class FigmaAuthenticationService {
  private _webviewProvider: ChatViewProvider;
  private _figmaAuthenticationProvider: FigmaAuthenticationProvider;

  constructor(webviewProvider: ChatViewProvider, figmaAuthenticationProvider: FigmaAuthenticationProvider) {
    this._webviewProvider = webviewProvider;
    this._figmaAuthenticationProvider = figmaAuthenticationProvider;

    figmaAuthenticationProvider.onDidChangeSessions(async (e) => {
      if (e.added && e.added.length > 0) {
        await this.authenticate(figmaAuthenticationProvider, e.added[0] as FigmaAuthenticationSession);
      }
    });
  }

  /**
   * Command to connect figma account to Superflex.
   */
  async connect(): Promise<FigmaTokenInformation> {
    const session = (await vscode.authentication.getSession(FIGMA_AUTH_PROVIDER_ID, [], {
      createIfNone: true,
    })) as FigmaAuthenticationSession;

    vscode.window.showInformationMessage(`Connected Figma account <${session.account.label}> to Superflex! 🎉`);

    const figmaTokenInfo: FigmaTokenInformation = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    };

    this._webviewProvider.sendEventMessage(newEventMessage("figma_oauth_connect", true));

    return figmaTokenInfo;
  }

  /**
   * Command to disconnect figma account from Superflex.
   */
  async disconnect(provider: vscode.AuthenticationProvider): Promise<void> {
    const session = await vscode.authentication.getSession(FIGMA_AUTH_PROVIDER_ID, [], { createIfNone: false });
    if (session) {
      await provider.removeSession(session.id);
    }

    FigmaApiProvider.setHeader("Authorization", null);
    FigmaApiProvider.removeResponseInterceptor();

    this._webviewProvider.sendEventMessage(newEventMessage("figma_oauth_disconnect"));

    vscode.commands.executeCommand("setContext", "superflex.figma.authenticated", false);
    vscode.window.showInformationMessage("Disconnected Figma account from Superflex!");
  }

  /**
   * We need to authenticate the user on extension activation to ensure that the user is authenticated before making any API calls.
   */
  async authenticate(provider: vscode.AuthenticationProvider, session?: FigmaAuthenticationSession): Promise<void> {
    if (!session) {
      const rawSession = await vscode.authentication.getSession(FIGMA_AUTH_PROVIDER_ID, [], { createIfNone: false });
      if (!rawSession) {
        return;
      }

      session = rawSession as FigmaAuthenticationSession;
    }

    this.setAuthHeader(session, () => this.disconnect(provider));
  }

  private async setAuthHeader(session: FigmaAuthenticationSession, disconnect: () => void): Promise<void> {
    try {
      FigmaApiProvider.setHeader("Authorization", `Bearer ${session.accessToken}`);
      FigmaApiProvider.addRefreshTokenInterceptor(async (err) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          try {
            const newTokenInfo = await figmaRefreshAccessToken({ refreshToken: session.refreshToken });
            if (newTokenInfo) {
              this._figmaAuthenticationProvider.updateSession(session.id, newTokenInfo);
              FigmaApiProvider.setHeader("Authorization", `Bearer ${newTokenInfo.accessToken}`);
            }

            const originalRequest = err.config;
            originalRequest.headers["Authorization"] = `Bearer ${newTokenInfo.accessToken}`;
            const res = await axios(originalRequest);
            return Promise.resolve(res);
          } catch (err) {
            disconnect();
            return Promise.reject(err);
          }
        }

        return Promise.reject(err);
      });

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
