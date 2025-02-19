import path from 'node:path'
import * as vscode from 'vscode'

import {
  type EventRequestMessage,
  type EventRequestPayload,
  EventRequestToResponseTypeMap,
  EventRequestType,
  type EventResponseMessage,
  EventResponseType,
  type FilePayload,
  newEventRequest,
  newEventResponse
} from '../../shared/protocol'
import { getMetaKeyLabel } from '../common/operatingSystem'
import {
  debounce,
  decodeUriAndRemoveFilePrefix,
  generateFileID,
  getNonce,
  getOpenWorkspace
} from '../common/utils'
import type { ChatAPI } from './ChatApi'

export default class ChatViewProvider implements vscode.WebviewViewProvider {
  private _extensionUri: vscode.Uri
  private _eventMessagesQueue: EventResponseMessage<EventResponseType>[] = []

  private _chatWebviewView?: vscode.WebviewView
  private _chatWebview?: vscode.Webview
  private _workspaceDirPath?: string
  private _currentOpenFile?: string
  private _copiedText: FilePayload | null = null
  private _decorationType: vscode.TextEditorDecorationType
  private debouncedShowInlineTip: (
    editor: vscode.TextEditor,
    selection: vscode.Selection
  ) => void

  constructor(
    private context: vscode.ExtensionContext,
    private chatApi: ChatAPI
  ) {
    this._extensionUri = context.extensionUri

    this._decorationType = vscode.window.createTextEditorDecorationType({
      after: {
        contentText: `Superflex: Add to Chat (${getMetaKeyLabel()}+M)`,
        color: new vscode.ThemeColor('editorCodeLens.foreground'),
        margin: '0 0 0 6em'
      }
    })

    this.debouncedShowInlineTip = debounce(this._showInlineTip.bind(this), 100)

    // Register the commands
    context.subscriptions.push(
      vscode.commands.registerCommand('superflex.chat.focus-input', () => {
        this.focusChatInput()
      })
    )
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'superflex.add-selection-to-chat',
        async () => {
          const editor = vscode.window.activeTextEditor
          if (!editor) {
            return
          }

          const selection = editor.selection
          if (
            selection.isEmpty ||
            selection.end.line === selection.start.line
          ) {
            return
          }

          await this.focusChatInput()
          this._handleAddSelectionToChat(editor, selection)
        }
      )
    )

    context.subscriptions.push(
      vscode.commands.registerCommand(
        'superflex.add-copy-to-chat',
        async () => {
          // Execute the default copy command first
          await vscode.commands.executeCommand(
            'editor.action.clipboardCopyAction'
          )
          await new Promise(resolve => setTimeout(resolve, 100))

          this._handleCopySelectionToChat()
        }
      )
    )

    context.subscriptions.push(
      vscode.commands.registerCommand(
        'superflex.chat.new-thread',
        () =>
          this._chatWebview &&
          this.handleEventMessage(newEventRequest(EventRequestType.NEW_THREAD))
      ),
      vscode.commands.registerCommand(
        'superflex.chat.refresh',
        () =>
          this._chatWebview &&
          this.sendEventMessage(newEventResponse(EventResponseType.REFRESH))
      ),
      vscode.commands.registerCommand('superflex.settings', () => {
        this._chatWebview &&
          this.sendEventMessage(
            newEventResponse(EventResponseType.SHOW_SETTINGS_VIEW)
          )
      })
    )

    // Register diff-related commands
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'superflex.acceptDiff',
        (fileUri: string) => {
          this.chatApi.verticalDiffManager.acceptRejectAllChanges(true, fileUri)
        }
      ),
      vscode.commands.registerCommand(
        'superflex.rejectDiff',
        (fileUri: string) => {
          this.chatApi.verticalDiffManager.acceptRejectAllChanges(
            false,
            fileUri
          )
        }
      ),
      vscode.commands.registerCommand(
        'superflex.acceptVerticalDiffBlock',
        (fileUri: string, index: number) => {
          this.chatApi.verticalDiffManager.acceptRejectVerticalDiffBlock(
            true,
            fileUri,
            index
          )
        }
      ),
      vscode.commands.registerCommand(
        'superflex.rejectVerticalDiffBlock',
        (fileUri: string, index: number) => {
          this.chatApi.verticalDiffManager.acceptRejectVerticalDiffBlock(
            false,
            fileUri,
            index
          )
        }
      )
    )

    const openWorkspace = getOpenWorkspace()
    if (!openWorkspace) {
      return
    }

    this._workspaceDirPath = decodeUriAndRemoveFilePrefix(
      openWorkspace.uri.path
    )

    // Subscribe to the active text editor change event
    vscode.window.onDidChangeActiveTextEditor(
      this._handleActiveEditorChange.bind(this)
    )

    // Subscribe to the selection change event
    context.subscriptions.push(
      vscode.window.onDidChangeTextEditorSelection(
        this._handleSelectionChange.bind(this)
      )
    )
  }

  sendEventMessage(msg: EventResponseMessage<EventResponseType>): void {
    // If the webview is not ready, queue the message
    if (!this._chatWebview) {
      this._eventMessagesQueue.push(msg)
      return
    }

    this._chatWebview.postMessage(msg)
  }

  async handleEventMessage(
    message: EventRequestMessage<EventRequestType>
  ): Promise<void> {
    const { command, payload } = message

    // When webview is ready consume all queued messages
    if (command === EventRequestType.READY) {
      while (this._eventMessagesQueue.length) {
        const msg = this._eventMessagesQueue.shift()
        this._chatWebview?.postMessage(msg)
      }
    }

    // When webview is initialized we need to set current open file
    if (command === EventRequestType.INITIALIZED) {
      this._handleActiveEditorChange(vscode.window.activeTextEditor)
    }

    try {
      if (command === EventRequestType.PASTE_COPIED_CODE) {
        const paste = payload as EventRequestPayload[typeof command]

        const eventResponse = newEventResponse(
          EventResponseType.PASTE_COPIED_CODE,
          null
        )
        eventResponse.id = message.id

        if (!this._copiedText || paste.text !== this._copiedText.content) {
          this.sendEventMessage(eventResponse)
          return
        }
        if (this._copiedText.startLine === this._copiedText.endLine) {
          this.sendEventMessage(eventResponse)
          return
        }

        eventResponse.payload = this._copiedText
        this.sendEventMessage(eventResponse)
        this._copiedText = null
        return
      }

      const resonsePayload = await this.chatApi.handleEvent(
        command,
        payload as EventRequestPayload[typeof command],
        this.sendEventMessage.bind(this)
      )

      // Uncomment the following line to see the event messages in the console, used for debugging
      // console.log({ id: message.id, command: message.command, data: JSON.stringify(payload) });
      const responseCommand = EventRequestToResponseTypeMap[command]
      if (!responseCommand) {
        return
      }

      const eventResponse = newEventResponse(responseCommand, resonsePayload)
      eventResponse.id = message.id

      this.sendEventMessage(eventResponse)
    } catch (err) {
      if (err instanceof Error && err.message === 'canceled') {
        return
      }

      console.error(
        `Failed to handle event. message: ${JSON.stringify(message)}, error: ${(err as Error).message}`
      )

      const responseCommand = EventRequestToResponseTypeMap[command]
      if (!responseCommand) {
        return
      }

      this.sendEventMessage({
        id: message.id,
        command: responseCommand,
        error: err as Error
      } as EventResponseMessage<typeof responseCommand>)

      vscode.window.showErrorMessage((err as Error).message)
    }
  }

  async focusChatInput(): Promise<void> {
    if (this._chatWebviewView?.visible) {
      this.sendEventMessage(
        newEventResponse(EventResponseType.FOCUS_CHAT_INPUT)
      )
      return Promise.resolve()
    }

    vscode.commands.executeCommand('workbench.view.extension.superflex')
    await this.chatApi.onReady()
    this._chatWebviewView?.show(true)
    this.sendEventMessage(newEventResponse(EventResponseType.FOCUS_CHAT_INPUT))
  }

  signout(): void {
    this.chatApi.setInitialized(false)
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    const localWebviewView = webviewView
    this._chatWebviewView = localWebviewView
    this._chatWebview = localWebviewView.webview

    localWebviewView.webview.options = {
      // Enable JavaScript in the webview
      enableScripts: true,
      // Restrict the webview to only load resources from the `dist` and `webview-ui/dist` directories
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'dist'),
        vscode.Uri.joinPath(this._extensionUri, 'webview-ui', 'dist')
      ],
      enableCommandUris: true
    }

    this._init()
    this._setWebviewHtml(localWebviewView.webview)
  }

  private _init() {
    if (!this._chatWebview) {
      return
    }

    this._chatWebview.onDidReceiveMessage(
      this.handleEventMessage.bind(this),
      undefined,
      this.context.subscriptions
    )
  }

  private _setWebviewHtml(webview: vscode.Webview): void {
    const theme = vscode.window.activeColorTheme.kind
    let themeClassname = ''
    switch (theme) {
      case vscode.ColorThemeKind.Dark:
        themeClassname = 'vscode-dark'
        break
      case vscode.ColorThemeKind.Light:
        themeClassname = 'vscode-light'
        break
      case vscode.ColorThemeKind.HighContrast:
        themeClassname = 'vscode-high-contrast'
        break
    }

    const stylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'webview-ui',
        'dist',
        'assets',
        'index.css'
      )
    )
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'webview-ui',
        'dist',
        'assets',
        'index.js'
      )
    )
    const superflexLogoUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'webview-ui',
        'dist',
        'assets',
        'logo.png'
      )
    )
    const figmaCopySelectionExampleImage = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'webview-ui',
        'dist',
        'assets',
        'figma-copy-selection-example.png'
      )
    )

    const nonce = getNonce()

    webview.html = `
      <!DOCTYPE html>
      <html lang="en" style="margin: 0; padding: 0; min-width: 100%; min-height: 100%">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy"
              content="default-src 'none';
                       connect-src 'self' http://localhost:3000 https://*.posthog.com https://www.youtube.com/ https://cdn.jsdelivr.net/;
                       style-src ${webview.cspSource} 'unsafe-inline' https://cdn.jsdelivr.net/;
                       font-src ${webview.cspSource} https://cdn.jsdelivr.net/;
                       img-src ${
                         webview.cspSource
                       } https://*.amazonaws.com https://lh3.googleusercontent.com blob: data:;
                       script-src 'nonce-${nonce}' 'unsafe-inline' https://*.posthog.com https://cdn.jsdelivr.net/;
                       frame-src https://www.youtube.com/;
                       worker-src blob:;">
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
    `
  }

  private _handleActiveEditorChange(
    editor: vscode.TextEditor | undefined
  ): void {
    if (!editor) {
      this._currentOpenFile = undefined
      this.sendEventMessage(
        newEventResponse(EventResponseType.SET_CURRENT_OPEN_FILE, null)
      )
      return
    }

    const newCurrentOpenFile = decodeUriAndRemoveFilePrefix(
      editor.document.uri.path
    )
    if (newCurrentOpenFile === this._currentOpenFile) {
      return
    }

    this._currentOpenFile = newCurrentOpenFile

    const relativePath = path.relative(
      this._workspaceDirPath ?? '',
      newCurrentOpenFile
    )
    this.sendEventMessage(
      newEventResponse(EventResponseType.SET_CURRENT_OPEN_FILE, {
        id: generateFileID(relativePath),
        name: path.basename(newCurrentOpenFile),
        path: newCurrentOpenFile,
        relativePath,
        isCurrentOpenFile: true
      } as FilePayload)
    )
  }

  private _handleSelectionChange(
    event: vscode.TextEditorSelectionChangeEvent
  ): void {
    const editor = event.textEditor
    const selection = editor.selection
    editor.setDecorations(this._decorationType, [])

    // Show tip only if selection spans multiple lines
    if (!selection.isEmpty && selection.end.line > selection.start.line) {
      this.debouncedShowInlineTip(editor, selection)
    }
  }

  private _showInlineTip(
    editor: vscode.TextEditor,
    selection: vscode.Selection
  ): void {
    const lineAbove = Math.max(selection.start.line - 1, 0)

    // Position the tip at the end of the line above the selected text
    const prevLine = editor.document.lineAt(lineAbove)
    const position = prevLine.isEmptyOrWhitespace
      ? new vscode.Position(lineAbove, 0) // Start of the line if it's empty
      : new vscode.Position(lineAbove, prevLine.text.length) // End of the text if line has content

    const range = new vscode.Range(position, position)
    editor.setDecorations(this._decorationType, [
      {
        range
      }
    ])
  }

  private _handleAddSelectionToChat(
    editor: vscode.TextEditor,
    selection: vscode.Selection
  ): void {
    if (!this._workspaceDirPath) {
      return
    }

    const document = editor.document
    const filePath = decodeUriAndRemoveFilePrefix(document.uri.path)

    const relativePath = path.relative(this._workspaceDirPath, filePath)
    const startPos = new vscode.Position(selection.start.line, 0)
    const endPos = new vscode.Position(
      selection.end.line,
      document.lineAt(selection.end.line).text.length
    )
    const fullLineSelection = new vscode.Range(startPos, endPos)

    const codeSelection: FilePayload = {
      id: generateFileID(
        relativePath,
        selection.start.line + 1,
        selection.end.line + 1
      ),
      name: path.basename(filePath),
      path: filePath,
      relativePath,
      startLine: selection.start.line + 1,
      endLine: selection.end.line + 1,
      content: document.getText(fullLineSelection)
    }

    // Send to webview
    this.sendEventMessage(
      newEventResponse(EventResponseType.ADD_SELECTED_CODE, codeSelection)
    )
  }

  private async _handleCopySelectionToChat(): Promise<void> {
    const editor = vscode.window.activeTextEditor
    if (!editor || !this._workspaceDirPath) {
      return
    }

    const selection = editor.selection
    if (selection.isEmpty) {
      return
    }

    const document = editor.document
    const filePath = decodeUriAndRemoveFilePrefix(document.uri.path)

    const relativePath = path.relative(this._workspaceDirPath, filePath)
    const codeSelection: FilePayload = {
      id: generateFileID(
        relativePath,
        selection.start.line + 1,
        selection.end.line + 1
      ),
      name: path.basename(filePath),
      path: filePath,
      relativePath,
      startLine: selection.start.line + 1,
      endLine: selection.end.line + 1,
      content: document.getText(selection)
    }

    this._copiedText = codeSelection
  }
}
