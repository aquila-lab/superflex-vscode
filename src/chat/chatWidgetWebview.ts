import * as vscode from "vscode";

import ChatViewProvider from "./ChatViewProvider";

const VIEW_ID = "superflex.chat";

export default function registerChatWidgetWebview(
  context: vscode.ExtensionContext,
  chatProvider: ChatViewProvider
): void {
  setChatWebview("loading");
  registerChatView(context, chatProvider);
}

let hasRegisteredChatWebview = false;

function registerChatView(context: vscode.ExtensionContext, chatProvider: ChatViewProvider) {
  if (!hasRegisteredChatWebview) {
    registerWebview(context, chatProvider);
  }

  setChatWebview("chat");
  setChatReady(true);
}

function registerWebview(context: vscode.ExtensionContext, chatProvider: ChatViewProvider): void {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(VIEW_ID, chatProvider, {
      webviewOptions: {
        retainContextWhenHidden: true, // keeps the state of the webview even when it's not visible
      },
    })
  );

  hasRegisteredChatWebview = true;
}

function setChatWebview(webviewName: "chat" | "loading") {
  void vscode.commands.executeCommand("setContext", "superflex.chat.webview", webviewName);
}

function setChatReady(ready: boolean) {
  void vscode.commands.executeCommand("setContext", "superflex.chat.ready", ready);
}
