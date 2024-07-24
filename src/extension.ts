import * as vscode from "vscode";

import { ChatAPI } from "./chat/ChatApi";
import ChatViewProvider from "./chat/ChatViewProvider";
import registerChatWidgetWebview from "./chat/chatWidgetWebview";
import { AUTH_PROVIDER_ID } from "./common/constants";
import ElementAIAuthenticationProvider from "./authentication/ElementAIAuthenticationProvider";
import ElementAIAuthenticationService from "./authentication/ElementAIAuthenticationService";
import FigmaAuthenticationService from "./authentication/FigmaAuthenticationService";
import FigmaAuthenticationProvider from "./authentication/FigmaAuthenticationProvider";
import { ElementAICache } from "./cache/ElementAICache";
import { AIProvider, SelfHostedAIProvider } from "./providers/AIProvider";
import OpenAIProvider from "./providers/OpenAIProvider";
import { getOpenWorkspace } from "./common/utils";

type AppState = {
  aiProvider: AIProvider;
  chatApi: ChatAPI;
  authService: ElementAIAuthenticationService;
  authProvider: ElementAIAuthenticationProvider;
  figmaAuthService: FigmaAuthenticationService;
  figmaAuthProvider: FigmaAuthenticationProvider;
  chatViewProvider: ChatViewProvider;
};

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const aiProvider = new OpenAIProvider();
  const chatApi = new ChatAPI(aiProvider);
  const chatWebviewProvider = new ChatViewProvider(context, chatApi);
  const authService = new ElementAIAuthenticationService(chatWebviewProvider, aiProvider);

  const appState: AppState = {
    aiProvider: aiProvider,
    chatApi: chatApi,
    authService: authService,
    authProvider: new ElementAIAuthenticationProvider(context, authService),
    figmaAuthService: new FigmaAuthenticationService(chatWebviewProvider),
    figmaAuthProvider: new FigmaAuthenticationProvider(context),
    chatViewProvider: chatWebviewProvider,
  };

  // Do not await on this function as we do not want VSCode to wait for it to finish
  // before considering Element AI ready to operate.
  void backgroundInit(context, appState);

  return Promise.resolve();
}

async function backgroundInit(context: vscode.ExtensionContext, appState: AppState) {
  registerElementAICache(context);
  registerAuthenticationProviders(context, appState);
  registerChatWidgetWebview(context, appState.chatViewProvider);
}

function registerElementAICache(context: vscode.ExtensionContext): void {
  ElementAICache.setStoragePath(context.storageUri);
  ElementAICache.setGlobalStoragePath(context.globalStorageUri);

  const openWorkspace = getOpenWorkspace();
  if (openWorkspace) {
    ElementAICache.setWorkspaceFolderPath(openWorkspace.uri);
  }
}

async function registerAuthenticationProviders(context: vscode.ExtensionContext, state: AppState): Promise<void> {
  context.subscriptions.push(state.authProvider);
  context.subscriptions.push(state.figmaAuthProvider);

  context.subscriptions.push(
    // Element AI Auth commands
    vscode.commands.registerCommand(`${AUTH_PROVIDER_ID}.signin`, () => state.authService.signIn(state.authProvider)),
    vscode.commands.registerCommand(`${AUTH_PROVIDER_ID}.signout`, () => state.authService.signOut(state.authProvider)),
    vscode.commands.registerCommand(`${AUTH_PROVIDER_ID}.remove-openai-api-key`, () => state.authService.removeToken()),

    // Figma Auth commands
    vscode.commands.registerCommand("elementai.figma.connect", () => state.figmaAuthService.connect()),
    vscode.commands.registerCommand("elementai.figma.disconnect", () =>
      state.figmaAuthService.disconnect(state.figmaAuthProvider)
    )
  );

  state.chatApi.registerEvent("login_clicked", async () => {
    await state.authService.signIn(state.authProvider);
  });
  state.chatApi.registerEvent<{ token: string }, void>("token_entered", async (req) => {
    if (state.aiProvider.discriminator === "self-hosted-ai-provider") {
      const selfHostedProvider = state.aiProvider as SelfHostedAIProvider;
      selfHostedProvider.setToken(req.token);
    }
    await state.authService.authenticateToken();
  });

  state.authService.authenticate(state.authProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
