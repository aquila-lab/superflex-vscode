export type FileObject = {
  /**
   * The unique file identifier, which can be referenced to retrieve the file.
   */
  id: string;

  /**
   * The relative filepath of the file.
   * Can be used as unique identifier for the file in workspace scope.
   */
  relativeFilepath: string;

  /**
   * The Unix timestamp (in seconds) for when the file was created.
   */
  createdAt: number;
};

export interface VectorStore {
  /**
   * The unique vector store identifier, which can be referenced to retrieve the vector store.
   */
  id: string;

  /**
   * Upload files to the vector store. Always send all files that should be in the vector store.
   * If there are duplicate files with same relative path, the files will be overwritten only if the content is different.
   * The files that are uploaded but missing from the filePaths will be removed.
   *
   * @param filePaths - The paths of the files to upload.
   * @returns A promise that resolves with the uploaded files.
   */
  uploadAndRemoveFiles(filePaths: string[]): Promise<void>;
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

export type ImageContent = {
  /**
   * Always `image`.
   */
  type: "image";

  /**
   * The URL of the image, must be a supported image types: jpeg, jpg, png, gif, webp.
   */
  imageUrl: string;
};

export type MessageContent = TextContent | ImageContent;

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
   * Send a message to the assistant.
   *
   * @param message - The message content to send.
   * @param streamResponse - Optional parameter to specify a callback function that will be called when the assistant sends a response.
   * @returns A promise that resolves with the response message.
   */
  sendMessage(message: MessageContent, streamResponse?: (event: TextDelta) => Promise<void>): Promise<Message>;
}

export interface AIProvider {
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
