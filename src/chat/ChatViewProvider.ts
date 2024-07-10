import * as vscode from "vscode";

import { ChatAPI } from "./ChatApi";
import { createWebviewHTMLTemplate } from "../webview/webviewTemplates";
import { EventMessage, newEventMessage } from "../protocol";

export default class ChatViewProvider implements vscode.WebviewViewProvider {
  private _extensionUri: vscode.Uri;
  private _eventMessagesQueue: EventMessage[] = [];

  private _chatWebviewView?: vscode.WebviewView;
  private _chatWebview?: vscode.Webview;

  constructor(private context: vscode.ExtensionContext, private chatApi: ChatAPI) {
    this._extensionUri = context.extensionUri;
  }

  private init() {
    if (!this._chatWebview) {
      return;
    }

    this._chatWebview.onDidReceiveMessage(
      async (message: EventMessage) => {
        // When webview is ready consume all queued messages
        if (message.command === "ready") {
          while (this._eventMessagesQueue.length) {
            const msg = this._eventMessagesQueue.shift();
            void this._chatWebview?.postMessage(msg);
          }
        }

        try {
          const payload = await this.chatApi.handleEvent(message.command, message.data, this.sendEventMessage);

          // Uncomment the following line to see the event messages in the console, used for debugging
          // console.log({ id: message.id, command: message.command, data: JSON.stringify(payload) });
          if (payload === undefined) {
            return;
          }

          void this.sendEventMessage({
            id: message.id,
            command: message.command,
            data: payload,
          } as EventMessage);
        } catch (err) {
          console.error(`Failed to handle event. message: ${JSON.stringify(message)}`);

          void this.sendEventMessage({
            id: message.id,
            command: message.command,
            error: (err as Error).message,
          } as EventMessage);
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  sendEventMessage(msg: EventMessage): void {
    // If the webview is not ready, queue the message
    if (!this._chatWebview) {
      this._eventMessagesQueue.push(msg);
      return;
    }

    void this._chatWebview.postMessage(msg);
  }

  async focusChatInput() {
    void vscode.commands.executeCommand("workbench.view.extension.elementai");
    await this.chatApi.onReady();
    void this._chatWebviewView?.show(true);
    void this._chatWebview?.postMessage(newEventMessage("focus-input"));
  }

  clearAllConversations() {
    void this._chatWebview?.postMessage(newEventMessage("clear-all-conversations"));
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void | Thenable<void> {
    const localWebviewView = webviewView;
    this._chatWebviewView = localWebviewView;
    this._chatWebview = localWebviewView.webview;
    localWebviewView.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
    };

    this.init();

    return this.setWebviewHtml(localWebviewView);
  }

  setWebviewHtml(webviewView: vscode.WebviewView): void {
    let scriptSrc = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist", "index.js")
    );

    let cssSrc = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist", "index.css")
    );

    const codiconsUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "node_modules", "@vscode/codicons", "dist", "codicon.css")
    );

    webviewView.webview.html = createWebviewHTMLTemplate(scriptSrc, cssSrc, codiconsUri);
  }
}
