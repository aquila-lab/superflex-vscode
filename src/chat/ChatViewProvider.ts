import * as vscode from "vscode";

import { ChatAPI } from "./ChatApi";
import { EventMessage, newEventMessage } from "../protocol";

export default class ChatViewProvider implements vscode.WebviewViewProvider {
  private _extensionUri: vscode.Uri;
  private _eventMessagesQueue: EventMessage[] = [];

  private _chatWebviewView?: vscode.WebviewView;
  private _chatWebview?: vscode.Webview;

  constructor(private context: vscode.ExtensionContext, private chatApi: ChatAPI) {
    this._extensionUri = context.extensionUri;

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "elementai.chat.new-thread",
        () => this._chatWebview && this.sendEventMessage(newEventMessage("cmd_new_thread"))
      ),
      vscode.commands.registerCommand(
        "elementai.project.sync",
        () => this._chatWebview && this.sendEventMessage(newEventMessage("cmd_sync_project"))
      )
    );
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
          const payload = await this.chatApi.handleEvent(
            message.command,
            message.data,
            this.sendEventMessage.bind(this)
          );

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
          console.error(
            `Failed to handle event. message: ${JSON.stringify(message)}, error: ${(err as Error).message}`
          );

          void this.sendEventMessage({
            id: message.id,
            command: message.command,
            error: (err as Error).message,
          } as EventMessage);

          vscode.window.showErrorMessage((err as Error).message);
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

  async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    const localWebviewView = webviewView;
    this._chatWebviewView = localWebviewView;
    this._chatWebview = localWebviewView.webview;

    localWebviewView.webview.options = {
      // Enable JavaScript in the webview
      enableScripts: true,
      // Restrict the webview to only load resources from the `webview-ui/dist` directory
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist")],
      enableCommandUris: true,
    };

    this.init();

    await this.setWebviewHtml(localWebviewView);
  }

  async setWebviewHtml(view: vscode.WebviewView): Promise<void> {
    const webviewPath = vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist");
    // Create Webview using vscode/index.html
    const root = vscode.Uri.joinPath(webviewPath, "index.html");
    const bytes = await vscode.workspace.fs.readFile(root);
    const decoded = new TextDecoder("utf-8").decode(bytes);
    const resources = view.webview.asWebviewUri(webviewPath);

    // This replace variables from the webview-ui/dist/index.html with webview info
    // 1. Update URIs to load styles and scripts into webview (eg. path that starts with ./)
    // 2. Update URIs for content security policy to only allow specific scripts to be run
    view.webview.html = decoded
      .replaceAll("./", `${resources.toString()}/`)
      .replaceAll("{cspSource}", view.webview.cspSource);

    console.log(view.webview.html);
  }
}
