import * as vscode from "vscode";
import { AuthenticationProvider } from "vscode";

import { newEventMessage } from "../protocol";
import { FIGMA_AUTH_PROVIDER_ID } from "../common/constants";
import ChatViewProvider from "../chat/ChatViewProvider";
import { FigmaAuthenticationSession, FigmaTokenInformation } from "./FigmaAuthenticationProvider";

export default class FigmaAuthenticationService {
  private _webviewProvider: ChatViewProvider;

  constructor(webviewProvider: ChatViewProvider) {
    this._webviewProvider = webviewProvider;
  }

  /**
   * Command to connect figma account to Element AI.
   */
  async connect(): Promise<FigmaTokenInformation> {
    const session = (await vscode.authentication.getSession(FIGMA_AUTH_PROVIDER_ID, [], {
      createIfNone: true,
    })) as FigmaAuthenticationSession;

    vscode.window.showInformationMessage(`Connected Figma account <${session.account.label}> to Element AI! 🎉`);

    const figmaTokenInfo: FigmaTokenInformation = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
    };

    this._webviewProvider.sendEventMessage(newEventMessage("figma_oauth_connect", figmaTokenInfo));

    return figmaTokenInfo;
  }

  /**
   * Command to disconnect figma account from Element AI.
   */
  async disconnect(provider: AuthenticationProvider): Promise<void> {
    const session = await vscode.authentication.getSession(FIGMA_AUTH_PROVIDER_ID, [], { createIfNone: false });
    if (session) {
      await provider.removeSession(session.id);
    }

    this._webviewProvider.sendEventMessage(newEventMessage("figma_oauth_disconnect"));

    vscode.commands.executeCommand("setContext", "elementai.figma.authenticated", false);
    vscode.window.showInformationMessage("Disconnected Figma account from Element AI!");
  }
}
