import * as vscode from "vscode";

import { ChatAPI } from "./ChatApi";
import { Logger } from "../utils/logger";
import { createWebviewTemplate } from "../webview/webviewTemplates";
import {
  EventMessage,
  newRequestEventMessage,
  newResponseEventMessage,
} from "../protocol";

export default class ChatViewProvider implements vscode.WebviewViewProvider {
  private chatWebviewView?: vscode.WebviewView;

  private chatWebview?: vscode.Webview;

  private extensionUri: vscode.Uri;

  constructor(
    private context: vscode.ExtensionContext,
    private chatApi: ChatAPI
  ) {
    this.extensionUri = context.extensionUri;
  }

  private init() {
    if (!this.chatWebview) {
      return;
    }

    this.chatWebview.onDidReceiveMessage(
      async (message: EventMessage) => {
        try {
          const payload = await this.chatApi.handleEvent(
            message.command,
            message.data
          );
          void this.chatWebview?.postMessage(
            newResponseEventMessage(message, payload)
          );
        } catch (e) {
          Logger.error(`failed to handle event. message: ${message.data}`);
          void this.chatWebview?.postMessage({
            id: message.id,
            command: message.command,
            error: (e as Error).message,
          } as EventMessage);
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  async focusChatInput() {
    void vscode.commands.executeCommand("workbench.view.extension.elementai");
    await this.waitForChatInitiated();
    void this.chatWebviewView?.show(true);
    void this.chatWebview?.postMessage(newRequestEventMessage("focus-input"));
  }

  clearAllConversations() {
    void this.chatWebview?.postMessage(
      newRequestEventMessage("clear-all-conversations")
    );
  }

  waitForChatInitiated(): Promise<unknown> {
    return this.chatApi.onReady;
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    const localWebviewView = webviewView;
    this.chatWebviewView = localWebviewView;
    this.chatWebview = localWebviewView.webview;
    localWebviewView.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
    };

    this.init();

    return this.setWebviewHtml(localWebviewView);
  }

  setWebviewHtml(webviewView: vscode.WebviewView): void {
    let scriptSrc = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "webview-ui", "dist", "index.js")
    );

    let cssSrc = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "webview-ui", "dist", "index.css")
    );

    const codiconsUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        "node_modules",
        "@vscode/codicons",
        "dist",
        "codicon.css"
      )
    );

    webviewView.webview.html = createWebviewTemplate(
      scriptSrc,
      cssSrc,
      codiconsUri
    );
  }
}
