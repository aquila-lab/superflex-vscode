import async from "async";
import * as vscode from "vscode";

import { EventMessage } from "../protocol";
import { AIProvider, Assistant, VectorStore } from "../providers/AIProvider";
import OpenAIProvider from "../providers/OpenAIProvider";
import { EventRegistry, Handler } from "./EventRegistry";
import { ElementAICache } from "../cache/ElementAICache";
import { getOpenWorkspace } from "../common/utils";

const SETTINGS_FILE = "settings.json";

type Settings = {
  vectorStoreID: string;
  assistantID: string;
};

type ProcessMessageRequest = {
  message?: string;
  imageUrl?: string;
};

export class ChatAPI {
  private _aiProvider: AIProvider;
  private _ready = new vscode.EventEmitter<void>();
  private _initialized = new vscode.EventEmitter<void>();
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

  private _vectorStore?: VectorStore;
  private _assistant?: Assistant;

  constructor(context: vscode.ExtensionContext, aiProvider: AIProvider) {
    this._aiProvider = aiProvider;

    this._chatEventRegistry
      .registerEvent<void, void>("ready", () => {
        this._ready.fire();
      })
      .registerEvent<void, boolean>("initialized", async () => {
        if (this._aiProvider instanceof OpenAIProvider) {
          this._aiProvider.init();
        }

        const openWorkspace = getOpenWorkspace();
        if (!openWorkspace) {
          return false;
        }

        await this.initialize(openWorkspace.name);
        this._initialized.fire();
        return true;
      })
      .registerEvent<ProcessMessageRequest, void>("process_message", async (req, sendEventMessageCb) => {});
  }

  onReady(): Promise<void> {
    return new Promise((resolve) => {
      this._ready.event(resolve);
    });
  }

  onInitialized(): Promise<void> {
    return new Promise((resolve) => {
      this._initialized.event(resolve);
    });
  }

  registerEvent<Req, Res>(command: string, handler: Handler<Req, Res>): void {
    this._chatEventRegistry.registerEvent<Req, Res>(command, handler);
  }

  handleEvent<Req, Res>(
    event: string,
    requestPayload: Req,
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<Res> {
    return this._chatEventRegistry.handleEvent(event, requestPayload, sendEventMessageCb);
  }

  private async initialize(workspaceName: string): Promise<void> {
    const rawSettings = ElementAICache.get(SETTINGS_FILE);
    if (rawSettings) {
      const settings = JSON.parse(rawSettings) as Settings;
      if (settings.vectorStoreID && settings.assistantID) {
        this._vectorStore = await this._aiProvider.retrieveVectorStore(settings.vectorStoreID);
        this._assistant = await this._aiProvider.retrieveAssistant(settings.assistantID);
        return;
      }
    }

    this._vectorStore = await this._aiProvider.createVectorStore(workspaceName);
    this._assistant = await this._aiProvider.createAssistant(this._vectorStore);

    ElementAICache.set(
      SETTINGS_FILE,
      JSON.stringify({ vectorStoreID: this._vectorStore.id, assistantID: this._assistant.id } as Settings)
    );
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
