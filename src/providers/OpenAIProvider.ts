import fs from "fs";
import OpenAI from "openai";
import { AssistantCreateParams } from "openai/src/resources/beta/assistants.js";

import { ElementAICache } from "../cache/ElementAICache";
import { ASSISTANT_DESCRIPTION, ASSISTANT_INSTRUCTIONS, ASSISTANT_NAME } from "./constants";
import { AIProvider, Assistant, FileObject, Message, MessageContent, TextDelta, VectorStore } from "./AIProvider";

class OpenAIVectorStore implements VectorStore {
  id: string;

  private _openai: OpenAI;

  constructor(id: string, openai: OpenAI) {
    this.id = id;
    this._openai = openai;
  }

  async fetchFiles(): Promise<FileObject[]> {
    // Implement in the way that you will save file ids mapped to file path in the cache folder
    throw new Error("Method not implemented.");
  }

  // TODO(boris): Handle overwriting files
  async uploadFiles(filePaths: string[]): Promise<void> {
    const documentPaths = ElementAICache.cacheFilesSync(filePaths);

    // Upload files to the storage in batches of 500
    const batchSize = 500;
    for (let i = 0; i < documentPaths.length; i += batchSize) {
      const fileStreams = documentPaths.slice(i, i + batchSize).map((path) => fs.createReadStream(path));
      await this._openai.beta.vectorStores.fileBatches.uploadAndPoll(this.id, { files: fileStreams });
    }

    ElementAICache.removeCachedFilesSync();
  }

  async removeFiles(filePaths: string[]): Promise<void> {
    // Not supported: Files that are not used in the vector store will expire after 7 days
  }
}

class OpenAIAssistant implements Assistant {
  id: string;

  private _openai: OpenAI;

  constructor(id: string, openai: OpenAI) {
    this.id = id;
    this._openai = openai;
  }

  async sendMessage(message: MessageContent, streamResponse?: (event: TextDelta) => Promise<void>): Promise<Message> {
    throw new Error("Method not implemented.");
  }
}

export default class OpenAIProvider implements AIProvider {
  private _openai: OpenAI;

  constructor(openai: OpenAI) {
    this._openai = openai;
  }

  async retrieveVectorStore(id: string): Promise<VectorStore> {
    const vectorStore = await this._openai.beta.vectorStores.retrieve(id);

    return new OpenAIVectorStore(vectorStore.id, this._openai);
  }

  async createVectorStore(name: string): Promise<VectorStore> {
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
    const assistant = await this._openai.beta.assistants.retrieve(id);

    return new OpenAIAssistant(assistant.id, this._openai);
  }

  async createAssistant(vectorStore?: VectorStore): Promise<Assistant> {
    const createParams: AssistantCreateParams = {
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
}
