export interface VectorStore {
  /**
   * The unique vector store identifier, which can be referenced to retrieve the vector store.
   */
  id: string;

  /**
   * Sync files upload files to the vector store. Always send all files that should be in the vector store.
   * If there are duplicate files with same relative path, the files will be overwritten only if the content is different.
   * The files that are uploaded but missing from the filePaths input will be removed.
   *
   * @param filePaths - The paths of the files to upload.
   * @param progressCb - Optional parameter to specify a callback function that will be called periodically with the current progress of syncing the files. "current" is value between 0 and 100.
   * @returns A promise that resolves with the uploaded files.
   */
  syncFiles(filePaths: string[], progressCb?: (current: number) => void): Promise<void>;
}

/**
 * The text content that is part of a message.
 */
export type TextContent = {
  /**
   * Always `text`.
   */
  type: "text";

  text: string;
};

export type ImageFileContent = {
  /**
   * Always `image_file`.
   */
  type: "image_file";

  /**
   * The URL of the image, must be a supported image types: jpeg, jpg, png, gif, webp.
   */
  imageUrl: string;
};

export type ImageUrlContent = {
  /**
   * Always `image`.
   */
  type: "image_url";

  /**
   * The URL of the image, must be a supported image types: jpeg, jpg, png, gif, webp.
   */
  imageUrl: string;
};

export type FigmaFileContent = {
  /**
   * Always `figma`.
   */
  type: "figma";

  content: any;
};

export type MessageContent = TextContent | ImageFileContent | ImageUrlContent | FigmaFileContent;

export type Message = {
  /**
   * The unique message identifier, which can be referenced to retrieve the message.
   */
  id: string;

  /**
   * The content of the message.
   */
  content: string;

  /**
   * The Unix timestamp (in seconds) for when the message was created.
   */
  createdAt: number;
};

export type TextDelta = {
  /**
   * The data that makes up the text.
   */
  value?: string;
};

export interface Assistant {
  /**
   * The unique assistant identifier, which can be referenced to retrieve the assistant.
   */
  id: string;

  /**
   * Create a new thread for the assistant.
   *
   * @returns A promise that resolves when the new thread is created.
   */
  createNewThread(): Promise<void>;

  /**
   * Send a message in a thread to the assistant. If there is no active thread, a new thread will be created.
   *
   * @param messages - The messages to send to the assistant.
   * @param streamResponse - Optional parameter to specify a callback function that will be called when the assistant sends a response.
   * @returns A promise that resolves with the response message.
   */
  sendMessage(messages: MessageContent[], streamResponse?: (event: TextDelta) => void): Promise<Message[]>;
}

interface Discriminator {
  discriminator: "ai-provider" | "self-hosted-ai-provider";
}

export interface AIProvider extends Discriminator {
  /**
   * Initialize the provider.
   *
   * @param force - Optional parameter to force initialization.
   */
  init(force?: boolean): Promise<void>;

  /**
   * Retrieve vector store by ID.
   *
   * @param id - The ID of the vector store to retrieve.
   * @returns The vector store instance.
   */
  retrieveVectorStore(id: string): Promise<VectorStore>;

  /**
   * Create a vector store.
   *
   * @param name - The name of the vector store to create.
   * @returns The vector store instance.
   */
  createVectorStore(name: string): Promise<VectorStore>;

  /**
   * Retrieve assistant by ID.
   *
   * @param id - The ID of the assistant to retrieve.
   * @returns The assistant instance.
   */
  retrieveAssistant(id: string): Promise<Assistant>;

  /**
   * Create an assistant.
   *
   * @param vectorStore - Optional parameter to specify the vector store to create the assistant with.
   * @returns The assistant instance.
   */
  createAssistant(vectorStore?: VectorStore): Promise<Assistant>;
}

export interface SelfHostedAIProvider extends AIProvider {
  /**
   * Check if the provider has a valid token and returns it.
   *
   * @returns The token if it exists, otherwise null.
   */
  getToken(): string | null;

  /**
   * Set the token for the provider.
   *
   * @param token - The token to set.
   */
  setToken(token: string): void;

  /**
   * Remove the token from the provider.
   */
  removeToken(): void;
}
