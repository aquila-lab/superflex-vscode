import * as vscode from "vscode";

import { ChatAPI } from "./chat/ChatApi";
import { getOpenWorkspace } from "./common/utils";
import { AUTH_PROVIDER_ID } from "./common/constants";
import ChatViewProvider from "./chat/ChatViewProvider";
import { SuperflexCache } from "./cache/SuperflexCache";
import { FigmaTokenInformation } from "./model/Figma.model";
import registerChatWidgetWebview from "./chat/chatWidgetWebview";
import FigmaAuthenticationService from "./authentication/FigmaAuthenticationService";
import FigmaAuthenticationProvider from "./authentication/FigmaAuthenticationProvider";
import SuperflexAuthenticationService from "./authentication/SuperflexAuthenticationService";
import SuperflexAuthenticationProvider from "./authentication/SuperflexAuthenticationProvider";

type AppState = {
  chatApi: ChatAPI;
  authService: SuperflexAuthenticationService;
  authProvider: SuperflexAuthenticationProvider;
  figmaAuthService: FigmaAuthenticationService;
  figmaAuthProvider: FigmaAuthenticationProvider;
  chatViewProvider: ChatViewProvider;
};

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const chatApi = new ChatAPI();
  const chatWebviewProvider = new ChatViewProvider(context, chatApi);
  const authService = new SuperflexAuthenticationService(chatWebviewProvider);
  const figmaAuthProvider = new FigmaAuthenticationProvider(context);

  const appState: AppState = {
    chatApi: chatApi,
    authService: authService,
    authProvider: new SuperflexAuthenticationProvider(context, authService),
    figmaAuthService: new FigmaAuthenticationService(chatWebviewProvider, figmaAuthProvider),
    figmaAuthProvider: figmaAuthProvider,
    chatViewProvider: chatWebviewProvider,
  };

  // Do not await on this function as we do not want VSCode to wait for it to finish
  // before considering Superflex ready to operate.
  void backgroundInit(context, appState);

  return Promise.resolve();
}

async function backgroundInit(context: vscode.ExtensionContext, appState: AppState) {
  registerSuperflexCache(context);
  registerAuthenticationProviders(context, appState);
  registerChatWidgetWebview(context, appState.chatViewProvider);

  appState.chatApi.registerEvent<string, void>("error_message", (errMsg) => {
    vscode.window.showErrorMessage(errMsg);
  });
}

function registerSuperflexCache(context: vscode.ExtensionContext): void {
  SuperflexCache.setStoragePath(context.storageUri);
  SuperflexCache.setGlobalStoragePath(context.globalStorageUri);

  const openWorkspace = getOpenWorkspace();
  if (openWorkspace) {
    SuperflexCache.setWorkspaceFolderPath(openWorkspace.uri);
  }
}

async function registerAuthenticationProviders(context: vscode.ExtensionContext, state: AppState): Promise<void> {
  context.subscriptions.push(state.authProvider);
  context.subscriptions.push(state.figmaAuthProvider);

  context.subscriptions.push(
    // Superflex Auth commands
    vscode.commands.registerCommand(`${AUTH_PROVIDER_ID}.signin`, () => state.authService.signIn(state.authProvider)),
    vscode.commands.registerCommand(`${AUTH_PROVIDER_ID}.signout`, () => state.authService.signOut(state.authProvider)),

    // Figma Auth commands
    vscode.commands.registerCommand("superflex.figma.connect", () => state.figmaAuthService.connect()),
    vscode.commands.registerCommand("superflex.figma.disconnect", () =>
      state.figmaAuthService.disconnect(state.figmaAuthProvider)
    )
  );

  state.chatApi.registerEvent("login_clicked", async () => {
    await state.authService.signIn(state.authProvider);
  });
  state.chatApi.registerEvent<void, FigmaTokenInformation>("figma_oauth_connect", async () => {
    return await state.figmaAuthService.connect();
  });

  state.authService.authenticate(state.authProvider);
  state.figmaAuthService.authenticate(state.figmaAuthProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
