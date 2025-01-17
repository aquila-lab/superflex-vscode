import { FilePayload } from "../../shared/protocol";
import { Message, MessageContent, TextDelta, Thread, ThreadRun } from "../../shared/model";

export interface Assistant {
  /**
   * Create a new chat thread.
   *
   * @param title - Optional parameter to specify the title of the thread.
   * @returns A promise that resolves with the created thread.
   */
  createThread(title?: string): Promise<Thread>;

  /**
   * Get all threads.
   *
   * @returns A promise that resolves with an array of threads.
   */
  getThreads(): Promise<Thread[]>;

  /**
   * Get a specific thread by ID.
   *
   * @param threadID - The ID of the thread to fetch.
   * @returns A promise that resolves with the thread.
   */
  getThread(threadID: string): Promise<Thread>;

  /**
   * Send a message in a chat thread. If there is no active thread, a new thread will be created.
   *
   * @param threadID - The ID of the thread to send the message to.
   * @param files - The files to send to the assistant.
   * @param messages - The messages to send to the assistant.
   * @param streamResponse - Optional parameter to specify a callback function that will be called when the assistant sends a response.
   * @returns A promise that resolves with the response message or null if the request is aborted.
   */
  sendMessage(
    threadID: string,
    files: FilePayload[],
    messages: MessageContent[],
    streamResponse?: (event: TextDelta) => void
  ): Promise<ThreadRun | null>;

  /**
   * Update a message in a chat thread.
   *
   * @param message - The message to update.
   * @returns A promise that resolves when the message is updated.
   */
  updateMessage(message: Message): Promise<void>;

  /**
   * Apply the code to the file in the workspace.
   *
   * @param code - The original content of the file.
   * @param edits - The code to apply to the file.
   * @returns A promise that resolves when the code is applied to the file.
   */
  fastApply(code: string, edits: string): Promise<string>;

  /**
   * Sync files parse and upload small bites of project files to the vector store.
   * NOTE: If there are duplicate files with same relative path, the files will be overwritten only if the content is different.
   * NOTE: The files that are uploaded but missing from the filePaths input will be removed.
   *
   * @param progressCb - Optional parameter to specify a callback function that will be called periodically with the current progress of syncing the files. "current" is value between 0 and 100.
   * @param isFirstTimeSync - Optional parameter to specify if the sync is the first time sync.
   * @returns A promise that resolves with the uploaded files.
   */
  syncFiles(progressCb?: (current: number, isFirstTimeSync?: boolean) => void): Promise<void>;
}
