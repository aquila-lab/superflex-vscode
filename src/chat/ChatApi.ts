import fs from "fs";
import OpenAI from "openai";
import * as vscode from "vscode";

import { EventRegistry } from "./EventRegistry";

type ProcessMessageRequest = {
  message?: string;
  imageUrl?: string;
};

type APIService = {
  openai: OpenAI;
};

// AssistantStream is currently not exposed by openai package
// Replace this once when it is exposed
type AssistantStream = any;

export class ChatAPI {
  private ready = new vscode.EventEmitter<void>();
  private initialized = new vscode.EventEmitter<void>();
  private thread?: OpenAI.Beta.Threads.Thread;

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
      .registerEvent<ProcessMessageRequest, void>(
        "process_message",
        async (req) => {
          await this.onInitialized();
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

          this.addMessage(req);
        }
      );
  }

  async addMessage(
    message: ProcessMessageRequest
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
      content.push({
        type: "text",
        text: `Analize the image below focus on the following:
1. Identify the layout of the image, including the position of elements.
2. Identify elements such as input fields, buttons, dropdowns, etc.
3. If any part of the image is unclear, ask follow-up questions for clarification.
4. Once you have a clear understanding, proceed to recreate the layout in code, adhering to the project's coding style, design patterns, and reusing existing components.`,
      });

      const imageFile = await this.openai.files.create({
        purpose: "vision",
        file: fs.createReadStream(message.imageUrl),
      });

      content.push({
        type: "image_file",
        image_file: {
          file_id: imageFile.id,
          detail: "low",
        },
      });
    }

    await this.openai.beta.threads.messages.create(this.thread.id, {
      role: "user",
      content,
    });

    const stream = this.openai.beta.threads.runs.stream(this.thread.id, {
      assistant_id: this.assistant.id,
      tools: [{ type: "file_search", file_search: { max_num_results: 50 } }],
    });

    stream
      .on("textDelta", (event) => {
        console.log("assistent.textDelta <<<", JSON.stringify(event));
      })
      .on("end", () => {
        const currentRun = stream.currentRun();
        console.log("assistent.currentRun <<<", JSON.stringify(currentRun));
      });

    return stream.finalMessages();
  }

  public onReady(): Promise<void> {
    return new Promise((resolve) => {
      this.ready.event(resolve);
    });
  }

  public onInitialized(): Promise<void> {
    return new Promise((resolve) => {
      this.initialized.event(resolve);
    });
  }

  async setAssistant(
    assistant: OpenAI.Beta.Assistants.Assistant,
    vectorStore: OpenAI.Beta.VectorStores.VectorStore
  ): Promise<void> {
    this.assistant = assistant;
    this.vectorStore = vectorStore;
    this.initialized.fire();
  }

  async handleEvent<Req, Res>(
    event: string,
    requestPayload: Req
  ): Promise<Res> {
    return this.chatEventRegistry.handleEvent(event, requestPayload);
  }
}
