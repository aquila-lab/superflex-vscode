import fs from "fs";
import OpenAI from "openai";
import * as vscode from "vscode";
import async from "async";

import { EventRegistry, Handler } from "./EventRegistry";
import { EventMessage, newEventMessage } from "../protocol";

type ProcessMessageRequest = {
  message?: string;
  imageUrl?: string;
};

type APIService = {
  openai: OpenAI;
};

const codeBlockStartRegex = /```([A-Za-z]*)?\n/;
const codeBlockRegex = /```([A-Za-z]*)?\n([\s\S]*?)```/;

export class ChatAPI {
  private ready = new vscode.EventEmitter<void>();
  private thread?: OpenAI.Beta.Threads.Thread;
  private queue = async.queue(async (word: string, callback) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage("No active editor found!");
      callback();
      return;
    }

    await this.writeWord(editor, word);
    callback();
  }, 1); // Ensure tasks are processed one at a time

  private chatEventRegistry = new EventRegistry();
  private openai: OpenAI;
  private assistant?: OpenAI.Beta.Assistants.Assistant;
  private vectorStore?: OpenAI.Beta.VectorStores.VectorStore;

  constructor(context: vscode.ExtensionContext, service: APIService) {
    this.openai = service.openai;

    this.chatEventRegistry
      .registerEvent<void, void>("ready", async () => {
        this.ready.fire();
      })
      .registerEvent<ProcessMessageRequest, void>("process_message", async (req, sendEventMessageCb) => {
        if (!this.assistant) {
          console.error("IMPOSSIBLE STATE: Assistant not set");
          return;
        }

        if (!this.thread) {
          this.thread = await service.openai.beta.threads.create({
            messages: [
              {
                role: "assistant",
                content:
                  "Welcome, I'm your Copilot and I'm here to help you get things done faster.\n\nI'm powered by AI, so surprises and mistakes are possible. Make sure to verify any generated code or suggestions, and share feedback so that we can learn and improve.",
              },
            ],
          });
        }

        const messages = await this.addMessage(req, sendEventMessageCb);
        console.log("messages", JSON.stringify(messages));
      });
  }

  registerEvent<Req, Res>(command: string, handler: Handler<Req, Res>): void {
    this.chatEventRegistry.registerEvent<Req, Res>(command, handler);
  }

  private async addMessage(
    message: ProcessMessageRequest,
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<OpenAI.Beta.Threads.Message[]> {
    if (!this.assistant) {
      throw new Error("Assistant not initialized");
    }
    if (!this.vectorStore) {
      throw new Error("VectorStore not initialized");
    }
    if (!this.thread) {
      throw new Error("Thread not initialized");
    }

    const content: OpenAI.Beta.Threads.Messages.MessageContentPartParam[] = [];
    if (message.message) {
      content.push({
        type: "text",
        text: message.message,
      });
    }
    if (message.imageUrl) {
      const imageFile = await this.openai.files.create({
        purpose: "vision",
        file: fs.createReadStream(message.imageUrl),
      });

      content.push({
        type: "image_file",
        image_file: {
          file_id: imageFile.id,
          detail: "auto",
        },
      });
    }

    await this.openai.beta.threads.messages.create(this.thread.id, {
      role: "user",
      content,
    });

    const newMessageEvent = newEventMessage("new_message");
    sendEventMessageCb(newMessageEvent);

    const stream = this.openai.beta.threads.runs.stream(this.thread.id, {
      assistant_id: this.assistant.id,
      tools: [{ type: "file_search", file_search: { max_num_results: 50 } }],
    });

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error("No active text editor");
    }
    await this.clearEditorContent(editor);

    let writeIntoFile = false;
    let matchString = "";
    let disableWrite = false;

    stream
      .on("textDelta", (event) => {
        matchString += event.value;
        if (!disableWrite && writeIntoFile && matchString.match(codeBlockRegex)) {
          writeIntoFile = false;
          disableWrite = true;
          matchString = "";
        }

        if (writeIntoFile && !disableWrite) {
          this.enqueueWord(event.value || "");
        }

        if (!disableWrite && !writeIntoFile && matchString.match(codeBlockStartRegex)) {
          writeIntoFile = true;
        }

        sendEventMessageCb({
          id: newMessageEvent.id,
          command: "message_processing",
          data: event.value,
        } as EventMessage);
      })
      .on("end", () => {
        const currentRun = stream.currentRun();
        console.log("assistent.currentRun <<<", JSON.stringify(currentRun));
      });

    const final = await stream.finalMessages();
    return final;
  }

  private enqueueWord(word: string) {
    this.queue.push(word);
  }

  public onReady(): Promise<void> {
    return new Promise((resolve) => {
      this.ready.event(resolve);
    });
  }

  public setAssistant(
    assistant: OpenAI.Beta.Assistants.Assistant,
    vectorStore: OpenAI.Beta.VectorStores.VectorStore
  ): void {
    this.assistant = assistant;
    this.vectorStore = vectorStore;
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

  async handleEvent<Req, Res>(
    event: string,
    requestPayload: Req,
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<Res> {
    return this.chatEventRegistry.handleEvent(event, requestPayload, sendEventMessageCb);
  }
}
