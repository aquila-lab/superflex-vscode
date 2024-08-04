import fs from "fs";
import path from "path";
import asyncQ from "async";
import OpenAI from "openai";

import { ElementAICache, GLOBAL_SETTINGS_FILE_NAME, GlobalSettings, CachedFileObject } from "../cache/ElementAICache";
import { ASSISTANT_DESCRIPTION, ASSISTANT_INSTRUCTIONS, ASSISTANT_NAME } from "./constants";
import { Assistant, Message, MessageContent, SelfHostedAIProvider, TextDelta, VectorStore } from "./AIProvider";
import { jsonToMap, mapToJson } from "../common/utils";

const FILE_ID_MAP_NAME = "open-ai-file-id-map.json";

type CachedFile = {
  fileID: string;
  createdAt: number;
};

// Reviver function to handle specific deserialization logic for CachedFile
function cachedFileReviver(key: string, value: any): CachedFile {
  return { ...value };
}

class OpenAIVectorStore implements VectorStore {
  id: string;

  private _openai: OpenAI;

  constructor(id: string, openai: OpenAI) {
    this.id = id;
    this._openai = openai;
  }

  async syncFiles(filePaths: string[], progressCb?: (current: number) => void): Promise<void> {
    if (!ElementAICache.storagePath) {
      throw new Error("Storage path is not set");
    }

    if (progressCb) {
      progressCb(0);
    }

    const storagePath = ElementAICache.storagePath;
    const cachedFilePathToIDMap = ElementAICache.get(FILE_ID_MAP_NAME);
    const filePathToIDMap: Map<string, CachedFile> = cachedFilePathToIDMap
      ? jsonToMap<CachedFile>(cachedFilePathToIDMap, cachedFileReviver)
      : new Map<string, CachedFile>();

    const documentPaths = ElementAICache.cacheFilesSync(filePaths, { ext: ".txt" });
    const progressCoefficient = 98 / documentPaths.length;

    const workers = this.createSyncWorkers(filePathToIDMap, storagePath, 10);
    await this.processFiles(workers, documentPaths, progressCoefficient, progressCb);

    if (progressCb) {
      progressCb(99);
    }

    await this.cleanUpFiles(filePathToIDMap, documentPaths, storagePath);

    ElementAICache.set(FILE_ID_MAP_NAME, mapToJson(filePathToIDMap));
    ElementAICache.removeCachedFilesSync();

    if (progressCb) {
      progressCb(100);
    }
  }

  private createSyncWorkers(
    filePathToIDMap: Map<string, CachedFile>,
    storagePath: string,
    concurrency: number
  ): asyncQ.QueueObject<CachedFileObject> {
    const workers = asyncQ.queue(async (documentPath: CachedFileObject) => {
      const fileStat = fs.statSync(documentPath.originalPath);

      const relativeFilepath = path.relative(storagePath, documentPath.cachedPath);
      const cachedFile = filePathToIDMap.get(relativeFilepath);

      // Skip uploading the file if it has not been modified since the last upload
      if (cachedFile && fileStat.mtime.getTime() <= cachedFile.createdAt) {
        return;
      }

      try {
        if (cachedFile) {
          try {
            await this._openai.files.del(cachedFile.fileID);
          } catch (err) {
            // Ignore
          }
        }

        const file = await this._openai.files.create({
          file: fs.createReadStream(documentPath.cachedPath),
          purpose: "assistants",
        });

        await this._openai.beta.vectorStores.files.createAndPoll(this.id, { file_id: file.id });

        filePathToIDMap.set(relativeFilepath, { fileID: file.id, createdAt: fileStat.mtime.getTime() });
      } catch (err: any) {
        console.error(`Failed to upload file ${documentPath}: ${err?.message}`);
      }
    }, concurrency); // Number of concurrent workers

    return workers;
  }

  private processFiles(
    workers: asyncQ.QueueObject<CachedFileObject>,
    documentPaths: CachedFileObject[],
    progressCoefficient: number,
    progressCb?: (current: number) => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (documentPaths.length === 0) {
        resolve();
        return;
      }

      documentPaths.forEach((documentPath, index) => {
        workers.push(documentPath, () => {
          if (progressCb) {
            progressCb(Math.round(index * progressCoefficient));
          }
        });
      });

      // Resolve the promise when all tasks are finished
      workers.drain(() => {
        console.info("Syncing files completed successfully.");
        resolve();
      });

      // Optionally handle errors
      workers.error((err, task) => {
        console.error(`Error processing file ${task}: ${err.message}`);
        reject(err);
      });
    });
  }

  private async cleanUpFiles(
    filePathToIDMap: Map<string, CachedFile>,
    documentPaths: CachedFileObject[],
    storagePath: string
  ): Promise<void> {
    for (const [relativeFilepath, cachedFile] of filePathToIDMap) {
      const exists = documentPaths.find(
        (documentPath) => path.relative(storagePath, documentPath.cachedPath) === relativeFilepath
      );
      if (exists) {
        continue;
      }

      try {
        await this._openai.files.del(cachedFile.fileID);
        filePathToIDMap.delete(relativeFilepath);
      } catch (err: any) {
        if (err?.status === 404) {
          filePathToIDMap.delete(relativeFilepath);
          return;
        }
        console.error(`Failed to delete file ${relativeFilepath}: ${err?.message}`);
      }
    }
  }
}

class OpenAIAssistant implements Assistant {
  id: string;

  private _openai: OpenAI;
  private _thread?: OpenAI.Beta.Threads.Thread;
  private _numMessages = 0;

  constructor(id: string, openai: OpenAI) {
    this.id = id;
    this._openai = openai;
  }

  async createNewThread(): Promise<void> {
    if (this._thread && this._numMessages === 0) {
      return;
    }

    this._thread = await this._openai.beta.threads.create({
      messages: [
        {
          role: "assistant",
          content:
            "Welcome, I'm your Copilot and I'm here to help you get things done faster.\n\nI'm powered by AI, so surprises and mistakes are possible. Make sure to verify any generated code or suggestions, and share feedback so that we can learn and improve.",
        },
      ],
    });

    this._numMessages = 0;
  }

  async sendMessage(messages: MessageContent[], streamResponse?: (event: TextDelta) => void): Promise<Message[]> {
    const content: OpenAI.Beta.Threads.Messages.MessageContentPartParam[] = [];
    for (const message of messages) {
      if (message.type === "text") {
        content.push({
          type: "text",
          text: message.text,
        });
      }
      if (message.type === "image_file") {
        const imageFile = await this._openai.files.create({
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
      if (message.type === "image_url") {
        content.push({
          type: "image_url",
          image_url: {
            url: message.imageUrl,
            detail: "auto",
          },
        });
      }
      if (message.type === "figma") {
        content.push({
          type: "text",
          text: message.content,
        });
      }
    }

    // If there is no active thread, create a new one
    if (!this._thread) {
      await this.createNewThread();
    }
    if (!this._thread) {
      throw new Error("Imposible case: thread is not created");
    }

    this._numMessages += content.length;

    await this._openai.beta.threads.messages.create(this._thread.id, {
      role: "user",
      content,
    });

    const stream = this._openai.beta.threads.runs.stream(this._thread.id, {
      assistant_id: this.id,
      tools: [{ type: "file_search", file_search: { max_num_results: 50 } }],
    });

    if (streamResponse) {
      stream.on("textDelta", (event) => streamResponse({ value: event.value }));
    }

    const final = await stream.finalMessages();
    return final.map((msg) => {
      return {
        id: msg.id,
        content: msg.content
          .map((part) => {
            return part.type === "text" ? part.text.value : "";
          })
          .join(""), // Combine all text parts into a single string
        createdAt: new Date(msg.created_at).getTime(),
      } as Message;
    });
  }
}

export default class OpenAIProvider implements SelfHostedAIProvider {
  discriminator: "ai-provider" | "self-hosted-ai-provider";

  private _openai?: OpenAI;

  constructor() {
    this.discriminator = "self-hosted-ai-provider";
  }

  async init(force?: boolean): Promise<void> {
    if (!force && this._openai) {
      return;
    }

    const openai = new OpenAI();
    await openai.files.list();
    this._openai = openai;
  }

  async retrieveVectorStore(id: string): Promise<VectorStore> {
    if (!this._openai) {
      throw new Error("OpenAI not initialized");
    }

    const vectorStore = await this._openai.beta.vectorStores.retrieve(id);

    return new OpenAIVectorStore(vectorStore.id, this._openai);
  }

  async createVectorStore(name: string): Promise<VectorStore> {
    if (!this._openai) {
      throw new Error("OpenAI not initialized");
    }

    const vectorStore = await this._openai.beta.vectorStores.create({
      name: `${name}-vector-store`,
      expires_after: {
        anchor: "last_active_at",
        days: 7,
      },
    });

    return new OpenAIVectorStore(vectorStore.id, this._openai);
  }

  async retrieveAssistant(id: string): Promise<Assistant> {
    if (!this._openai) {
      throw new Error("OpenAI not initialized");
    }

    const assistant = await this._openai.beta.assistants.retrieve(id);

    return new OpenAIAssistant(assistant.id, this._openai);
  }

  async createAssistant(vectorStore?: VectorStore): Promise<Assistant> {
    if (!this._openai) {
      throw new Error("OpenAI not initialized");
    }

    const createParams: OpenAI.Beta.AssistantCreateParams = {
      name: ASSISTANT_NAME,
      description: ASSISTANT_DESCRIPTION,
      instructions: ASSISTANT_INSTRUCTIONS,
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
      temperature: 0.2,
    };

    if (vectorStore) {
      createParams.tool_resources = {
        file_search: {
          vector_store_ids: [vectorStore.id],
        },
      };
    }

    const assistant = await this._openai.beta.assistants.create(createParams);

    return new OpenAIAssistant(assistant.id, this._openai);
  }

  getToken(): string | null {
    const rawSettings = ElementAICache.getGlobal(GLOBAL_SETTINGS_FILE_NAME);
    const settings = rawSettings ? (JSON.parse(rawSettings) as GlobalSettings) : {};
    if (!settings.openaiApiKey) {
      return null;
    }

    // DO NOT DELETE: This line is used to set the OpenAI API key in the environment
    process.env["OPENAI_API_KEY"] = settings.openaiApiKey;

    return settings.openaiApiKey;
  }

  setToken(token: string): void {
    const rawSettings = ElementAICache.getGlobal(GLOBAL_SETTINGS_FILE_NAME);
    const settings = rawSettings ? (JSON.parse(rawSettings) as GlobalSettings) : {};

    settings.openaiApiKey = token;
    ElementAICache.setGlobal(GLOBAL_SETTINGS_FILE_NAME, JSON.stringify(settings));
  }

  removeToken(): void {
    const rawSettings = ElementAICache.getGlobal(GLOBAL_SETTINGS_FILE_NAME);
    const settings = rawSettings ? (JSON.parse(rawSettings) as GlobalSettings) : {};

    delete settings.openaiApiKey;
    ElementAICache.setGlobal(GLOBAL_SETTINGS_FILE_NAME, JSON.stringify(settings));
  }
}
