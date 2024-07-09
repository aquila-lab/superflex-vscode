import OpenAI from "openai";

import { AIProvider, Assistant, FileObject, Message, MessageContent, TextDelta, VectorStore } from "./AIProvider";

class OpenAIVectorStore implements VectorStore {
  id: string;

  private _openai: OpenAI;

  constructor(id: string, openai: OpenAI) {
    this.id = id;
    this._openai = openai;
  }

  fetchFiles(): Promise<FileObject[]> {
    throw new Error("Method not implemented.");
  }

  uploadFiles(filePaths: string[]): Promise<FileObject[]> {
    throw new Error("Method not implemented.");
  }

  removeFiles(filePaths: string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

class OpenAIAssistant implements Assistant {
  id: string;

  private _openai: OpenAI;

  constructor(id: string, openai: OpenAI) {
    this.id = id;
    this._openai = openai;
  }

  sendMessage(message: MessageContent, streamResponse?: (event: TextDelta) => Promise<void>): Promise<Message> {
    throw new Error("Method not implemented.");
  }
}

export default class OpenAIProvider implements AIProvider {
  private _openai: OpenAI;

  constructor(openai: OpenAI) {
    this._openai = openai;
  }

  retrieveVectorStore(id: string): VectorStore {
    throw new Error("Method not implemented.");
  }

  createVectorStore(name: string): VectorStore {
    throw new Error("Method not implemented.");
  }

  retrieveAssistant(id: string): Assistant {
    throw new Error("Method not implemented.");
  }

  createAssistant(vectorStore?: VectorStore): Assistant {
    throw new Error("Method not implemented.");
  }
}
