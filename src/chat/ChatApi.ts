import async from "async";
import * as vscode from "vscode";

import { EventRegistry, Handler } from "./EventRegistry";
import { EventMessage } from "../protocol";
import { AIProvider } from "../providers/AIProvider";
import OpenAIProvider from "../providers/OpenAIProvider";

type ProcessMessageRequest = {
  message?: string;
  imageUrl?: string;
};

export class ChatAPI {
  private _aiProvider: AIProvider;
  private _ready = new vscode.EventEmitter<void>();
  private _chatEventRegistry = new EventRegistry();

  private _queue = async.queue(async (word: string, callback) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage("No active editor found!");
      callback();
      return;
    }

    await this.writeWord(editor, word);
    callback();
  }, 1); // Ensure tasks are processed one at a time

  constructor(context: vscode.ExtensionContext, aiProvider: AIProvider) {
    this._aiProvider = aiProvider;

    this._chatEventRegistry
      .registerEvent<void, void>("ready", async () => {
        this._ready.fire();

        if (this._aiProvider instanceof OpenAIProvider) {
          this._aiProvider.init();
        }
      })
      .registerEvent<ProcessMessageRequest, void>("process_message", async (req, sendEventMessageCb) => {});
  }

  onReady(): Promise<void> {
    return new Promise((resolve) => {
      this._ready.event(resolve);
    });
  }

  registerEvent<Req, Res>(command: string, handler: Handler<Req, Res>): void {
    this._chatEventRegistry.registerEvent<Req, Res>(command, handler);
  }

  async handleEvent<Req, Res>(
    event: string,
    requestPayload: Req,
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<Res> {
    return this._chatEventRegistry.handleEvent(event, requestPayload, sendEventMessageCb);
  }

  private enqueueWord(word: string) {
    this._queue.push(word);
  }

  private async clearEditorContent(editor: vscode.TextEditor) {
    const document = editor.document;
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));

    await editor.edit((editBuilder) => {
      editBuilder.delete(fullRange);
    });
    const startPosition = new vscode.Position(0, 0);
    editor.selection = new vscode.Selection(startPosition, startPosition);
  }

  private async writeWord(editor: vscode.TextEditor, word: string) {
    const currentPosition = editor.selection.active;
    await editor.edit((editBuilder) => {
      editBuilder.insert(currentPosition, word);
    });

    const newPosition = editor.document.positionAt(editor.document.getText().length);
    editor.selection = new vscode.Selection(newPosition, newPosition);
  }
}
