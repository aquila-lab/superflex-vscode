import * as vscode from "vscode";

import { EventMessage, EventPayloads, EventType, newEventRequest, newEventResponse } from "../../shared/protocol";
import { ChatAPI } from "./ChatApi";

export default class ChatViewProvider implements vscode.WebviewViewProvider {
  private _extensionUri: vscode.Uri;
  private _eventMessagesQueue: EventMessage[] = [];

  private _chatWebviewView?: vscode.WebviewView;
  private _chatWebview?: vscode.Webview;

  constructor(private context: vscode.ExtensionContext, private chatApi: ChatAPI) {
    this._extensionUri = context.extensionUri;

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "superflex.chat.new-thread",
        () => this._chatWebview && this.sendEventMessage(newEventRequest(EventType.CMD_NEW_THREAD))
      ),
      vscode.commands.registerCommand(
        "superflex.project.sync",
        () => this._chatWebview && this.sendEventMessage(newEventRequest(EventType.CMD_SYNC_PROJECT))
      )
    );
  }

  private init() {
    if (!this._chatWebview) {
      return;
    }

    this._chatWebview.onDidReceiveMessage(
      async (message: EventMessage<EventType>) => {
        const { command, payload } = message;

        // When webview is ready consume all queued messages
        if (command === EventType.READY) {
          while (this._eventMessagesQueue.length) {
            const msg = this._eventMessagesQueue.shift();
            void this._chatWebview?.postMessage(msg);
          }
        }

        try {
          const resonsePayload = await this.chatApi.handleEvent(
            command,
            payload as EventPayloads[typeof command]["request"],
            this.sendEventMessage.bind(this)
          );

          // Uncomment the following line to see the event messages in the console, used for debugging
          // console.log({ id: message.id, command: message.command, data: JSON.stringify(payload) });
          if (resonsePayload === undefined) {
            return;
          }

          const eventResponse = newEventResponse(command, resonsePayload);
          eventResponse.id = message.id;

          void this.sendEventMessage(eventResponse);
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
    void vscode.commands.executeCommand("workbench.view.extension.superflex");
    await this.chatApi.onReady();
    void this._chatWebviewView?.show(true);
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    const localWebviewView = webviewView;
    this._chatWebviewView = localWebviewView;
    this._chatWebview = localWebviewView.webview;

    localWebviewView.webview.options = {
      // Enable JavaScript in the webview
      enableScripts: true,
      // Restrict the webview to only load resources from the `dist` and `webview-ui/dist` directories
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, "dist"),
        vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist"),
      ],
      enableCommandUris: true,
    };

    this.init();

    this.setWebviewHtml(localWebviewView.webview);
  }

  setWebviewHtml(webview: vscode.Webview): void {
    const theme = vscode.window.activeColorTheme.kind;
    let themeClassname;
    switch (theme) {
      case vscode.ColorThemeKind.Dark:
        themeClassname = "vscode-dark";
        break;
      case vscode.ColorThemeKind.Light:
        themeClassname = "vscode-light";
        break;
      case vscode.ColorThemeKind.HighContrast:
        themeClassname = "vscode-high-contrast";
        break;
    }

    const stylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist", "assets", "index.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist", "assets", "index.js")
    );
    const superflexLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist", "assets", "logo.png")
    );
    const figmaCopySelectionExampleImage = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist", "assets", "figma-copy-selection-example.png")
    );

    webview.html = `
      <!DOCTYPE html>
      <html lang="en" style="margin: 0; padding: 0; min-width: 100%; min-height: 100%">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" type="text/css" href="${stylesUri}" />
          <title>Superflex</title>

          <style>
            .figma-copy-selection-example {
              background-image: url("${figmaCopySelectionExampleImage}");
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
            }
          </style>
        </head>
        <body class="${themeClassname}" data-vscode-theme-kind="${themeClassname}">
          <div id="root"></div>
          <script type="module" src="${scriptUri}"></script>
          <script>
            window.superflexLogoUri = "${superflexLogoUri.toString()}";
          </script>
        </body>
      </html>
    `;
  }
}
