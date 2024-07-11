import asyncQ from "async";
import * as vscode from "vscode";
import { Mutex } from "async-mutex";

import { findFiles } from "../scanner";
import { EventMessage, newEventMessage } from "../protocol";
import OpenAIProvider from "../providers/OpenAIProvider";
import { ElementAICache } from "../cache/ElementAICache";
import { SUPPORTED_FILE_EXTENSIONS } from "../common/constants";
import { AIProvider, Assistant, VectorStore } from "../providers/AIProvider";
import { decodeUriAndRemoveFilePrefix, getOpenWorkspace } from "../common/utils";
import { EventRegistry, Handler } from "./EventRegistry";

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
  private _isInitialized = false;
  private _initializedMutex = new Mutex();
  private _chatEventRegistry = new EventRegistry();
  private _isSyncProjectRunning = false;
  private _queue = asyncQ.queue(async (word: string, callback) => {
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

  constructor(aiProvider: AIProvider) {
    this._aiProvider = aiProvider;

    this._chatEventRegistry
      .registerEvent<void, void>("ready", () => {
        this._ready.fire();
      })
      .registerEvent<void, boolean>("initialized", async (_, sendEventMessageCb) => {
        const release = await this._initializedMutex.acquire();

        try {
          if (this._aiProvider instanceof OpenAIProvider) {
            this._aiProvider.init();
          }

          const openWorkspace = getOpenWorkspace();
          if (!openWorkspace) {
            return false;
          }

          await this.initializeAssistant(openWorkspace.name);
          await this.syncProjectFiles(openWorkspace, sendEventMessageCb);

          this._isInitialized = true;
          return true;
        } finally {
          release();
        }
      })
      .registerEvent<void, void>("sync_project", async (_, sendEventMessageCb) => {
        if (!this._isInitialized) {
          return;
        }

        // Prevent multiple sync project requests from running concurrently
        if (this._isSyncProjectRunning) {
          return;
        }
        this._isSyncProjectRunning = true;

        const openWorkspace = getOpenWorkspace();
        if (!openWorkspace) {
          return;
        }
        await this.syncProjectFiles(openWorkspace, sendEventMessageCb);

        this._isSyncProjectRunning = false;
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

  handleEvent<Req, Res>(
    event: string,
    requestPayload: Req,
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<Res> {
    return this._chatEventRegistry.handleEvent(event, requestPayload, sendEventMessageCb);
  }

  private async initializeAssistant(workspaceName: string): Promise<void> {
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

  private async syncProjectFiles(
    openWorkspace: vscode.WorkspaceFolder,
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<void> {
    const workspaceFolderPath = decodeUriAndRemoveFilePrefix(openWorkspace.uri.toString());
    const documentsUri: string[] = await findFiles(
      workspaceFolderPath,
      SUPPORTED_FILE_EXTENSIONS.map((ext) => `**/*${ext}`),
      ["**/node_modules/**", "**/build/**", "**/out/**", "**/dist/**"]
    );

    await this._vectorStore?.syncFiles(documentsUri, (progress) => {
      sendEventMessageCb(newEventMessage("sync_progress", { progress }));
    });
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
