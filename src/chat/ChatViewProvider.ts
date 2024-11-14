import path from "path";
import * as vscode from "vscode";
import { v4 as uuidv4 } from "uuid";

import {
  EventMessage,
  EventPayloads,
  EventType,
  FilePayload,
  newEventRequest,
  newEventResponse,
} from "../../shared/protocol";
import { decodeUriAndRemoveFilePrefix, getNonce, getOpenWorkspace } from "../common/utils";
import { ChatAPI } from "./ChatApi";

export default class ChatViewProvider implements vscode.WebviewViewProvider {
  private _extensionUri: vscode.Uri;
  private _eventMessagesQueue: EventMessage[] = [];

  private _chatWebviewView?: vscode.WebviewView;
  private _chatWebview?: vscode.Webview;
  private _workspaceDirPath?: string;
  private _currentOpenFile?: string;
  private _decorationType: vscode.TextEditorDecorationType;

  constructor(private context: vscode.ExtensionContext, private chatApi: ChatAPI) {
    this._extensionUri = context.extensionUri;

    this._decorationType = vscode.window.createTextEditorDecorationType({
      after: {
        contentText: "Superflex: Add to Chat (⌘+M)",
        margin: "0 0 0 1em",
        color: new vscode.ThemeColor("editorCodeLens.foreground"),
      },
    });

    // Register the command
    context.subscriptions.push(
      vscode.commands.registerCommand("superflex.addSelectionToChat", () => {
        this.handleAddSelectionToChat();
      })
    );

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

    const openWorkspace = getOpenWorkspace();
    if (!openWorkspace) {
      return;
    }

    this._workspaceDirPath = decodeUriAndRemoveFilePrefix(openWorkspace.uri.path);

    // Subscribe to the active text editor change event
    vscode.window.onDidChangeActiveTextEditor(this.handleActiveEditorChange.bind(this));

    // Subscribe to the selection change event
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(this.handleSelectionChange.bind(this)));
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

        // When webview is initialized we need to set current open file
        if (command === EventType.INITIALIZED) {
          this.handleActiveEditorChange(vscode.window.activeTextEditor);
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
            error: err as Error,
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

    const nonce = getNonce();

    webview.html = `
      <!DOCTYPE html>
      <html lang="en" style="margin: 0; padding: 0; min-width: 100%; min-height: 100%">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy"
              content="default-src 'none';
                       connect-src 'self' http://localhost:3000 https://us.posthog.com/ https://app.posthog.com/ https://us.i.posthog.com/ https://www.youtube.com/;
                       style-src ${webview.cspSource} 'unsafe-inline';
                       font-src ${webview.cspSource};
                       img-src ${
                         webview.cspSource
                       } https://*.amazonaws.com https://lh3.googleusercontent.com blob: data:;
                       script-src 'nonce-${nonce}' https://us.posthog.com/ https://app.posthog.com/ https://us-assets.i.posthog.com/;
                       frame-src https://www.youtube.com/;">
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
          <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
          <script nonce="${nonce}">
            window.superflexLogoUri = "${superflexLogoUri.toString()}";
          </script>
        </body>
      </html>
    `;
  }

  private handleActiveEditorChange(editor: vscode.TextEditor | undefined): void {
    if (!editor) {
      this._currentOpenFile = undefined;
      this.sendEventMessage(newEventRequest(EventType.SET_CURRENT_OPEN_FILE, null));
      return;
    }

    const newCurrentOpenFile = decodeUriAndRemoveFilePrefix(editor.document.uri.path);
    if (newCurrentOpenFile === this._currentOpenFile) {
      return;
    }

    this._currentOpenFile = newCurrentOpenFile;

    this.sendEventMessage(
      newEventRequest(EventType.SET_CURRENT_OPEN_FILE, {
        id: uuidv4(),
        name: path.basename(newCurrentOpenFile),
        path: newCurrentOpenFile,
        relativePath: path.relative(this._workspaceDirPath ?? "", newCurrentOpenFile),
        isCurrentOpenFile: true,
      })
    );
  }

  private handleSelectionChange(event: vscode.TextEditorSelectionChangeEvent): void {
    const editor = event.textEditor;
    const selection = editor.selection;

    // Clear existing decorations
    editor.setDecorations(this._decorationType, []);

    // Only show tip if there's an actual selection
    if (!selection.isEmpty) {
      const range = new vscode.Range(
        selection.end.line,
        selection.end.character,
        selection.end.line,
        selection.end.character
      );

      // Add the inline tip decoration
      editor.setDecorations(this._decorationType, [
        {
          range,
        },
      ]);
    }
  }

  private handleAddSelectionToChat(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !this._chatWebview || !this._workspaceDirPath) {
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      return;
    }

    const document = editor.document;
    const filePath = decodeUriAndRemoveFilePrefix(document.uri.path);

    const codeSelection: FilePayload = {
      id: uuidv4(),
      name: path.basename(filePath),
      path: filePath,
      relativePath: path.relative(this._workspaceDirPath, filePath),
      startLine: selection.start.line + 1,
      endLine: selection.end.line + 1,
      content: document.getText(selection),
    };

    // Send to webview
    this.sendEventMessage(newEventRequest(EventType.ADD_SELECTED_CODE, codeSelection));
  }
}
