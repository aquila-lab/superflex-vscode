import * as vscode from "vscode";

import { EventType, newEventRequest } from "../shared/protocol";
import { ChatAPI } from "./chat/ChatApi";
import { AUTH_PROVIDER_ID, SUPERFLEX_POSTHOG_API_KEY } from "./common/constants";
import { getExtensionVersion, getOpenWorkspace, getUniqueID } from "./common/utils";
import { Telemetry } from "./common/analytics/Telemetry";
import ChatViewProvider from "./chat/ChatViewProvider";
import { SuperflexCache } from "./cache/SuperflexCache";
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

  await initializeAnalytics(context, appState);

  // Do not await on this function as we do not want VSCode to wait for it to finish
  // before considering Superflex ready to operate.
  void backgroundInit(context, appState);

  Telemetry.capture("extension_activated", {});
  return Promise.resolve();
}

async function backgroundInit(context: vscode.ExtensionContext, appState: AppState) {
  registerSuperflexCache(context);
  registerAuthenticationProviders(context, appState);
  registerChatWidgetWebview(context, appState.chatViewProvider);

  appState.chatApi.registerEvent(EventType.SEND_NOTIFICATION, (payload) => {
    vscode.window.showInformationMessage(payload.message);
  });
  appState.chatApi.registerEvent(EventType.OPEN_EXTERNAL_URL, (payload) => {
    vscode.env.openExternal(vscode.Uri.parse(payload.url));
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

  state.chatApi.registerEvent(EventType.LOGIN_CLICKED, async () => {
    await state.authService.signIn(state.authProvider);
  });
  state.chatApi.registerEvent(EventType.CREATE_ACCOUNT_CLICKED, async () => {
    await state.authService.signIn(state.authProvider, true);
  });
  state.chatApi.registerEvent(EventType.CREATE_AUTH_LINK, async (payload) => {
    const { uri } = await state.authProvider.createAuthUniqueLink(payload.action === "create_account");
    await state.authProvider.waitForUserConsentToLogin();
    return { uniqueLink: uri.toString(true) };
  });

  state.chatApi.registerEvent(EventType.FIGMA_OAUTH_CONNECT, async () => {
    const token = await state.figmaAuthService.connect();
    return !!token && !!token.accessToken;
  });

  state.authService.authenticate(state.authProvider);
  state.figmaAuthService.authenticate(state.figmaAuthProvider);
}

async function initializeAnalytics(context: vscode.ExtensionContext, appState: AppState) {
  const config = vscode.workspace.getConfiguration("superflex");
  const analyticsEnabled = config.get<boolean>("analytics", false);

  appState.chatViewProvider.sendEventMessage(
    newEventRequest(EventType.CONFIG, { allowAnonymousTelemetry: analyticsEnabled })
  );

  if (analyticsEnabled && SUPERFLEX_POSTHOG_API_KEY) {
    const { uniqueID, isNew } = await getUniqueID(context);
    const extensionVersion = getExtensionVersion();

    await Telemetry.setup(analyticsEnabled, uniqueID, extensionVersion, {
      clientKey: SUPERFLEX_POSTHOG_API_KEY,
      url: "https://app.posthog.com",
    });

    if (isNew) {
      Telemetry.capture("new_anon_user", {});
    }
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
