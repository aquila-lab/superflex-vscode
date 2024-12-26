import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { Mutex } from "async-mutex";

import { Message, Thread } from "../../shared/model";
import {
  EventMessage,
  EventPayloads,
  EventType,
  FastApplyPayload,
  FigmaFile,
  FilePayload,
  newEventResponse,
  SendMessagesRequestPayload,
} from "../../shared/protocol";
import * as api from "../api";
import { FIGMA_AUTH_PROVIDER_ID } from "../common/constants";
import { decodeUriAndRemoveFilePrefix, generateFileID, getOpenWorkspace, toKebabCase } from "../common/utils";
import { Telemetry } from "../common/analytics/Telemetry";
import { EventRegistry, Handler } from "./EventRegistry";
import { getFigmaSelectionImageUrl, HttpStatusCode } from "../api";
import { extractFigmaSelectionUrl } from "../../shared/model/Figma.model";
import { Assistant } from "../assistant";
import SuperflexAssistant from "../assistant/SuperflexAssistant";
import { findWorkspaceFiles } from "../scanner";
import { VerticalDiffManager } from "../diff/vertical/manager";
import { myersDiff, createDiffStream } from "../diff/myers";

/**
 * ChatAPI class for interacting with the chat service.
 */
export class ChatAPI {
  private _assistant?: Assistant;
  private _isReady = false;
  private _ready = new vscode.EventEmitter<void>();
  private _isInitialized = false;
  private _initializedMutex = new Mutex();
  private _chatEventRegistry = new EventRegistry();
  private _isSyncProjectRunning = false;
  private _thread?: Thread;
  private _workspaceDirPath?: string;
  private _isPremiumGeneration = true;
  public verticalDiffManager: VerticalDiffManager;

  constructor(verticalDiffManager: VerticalDiffManager) {
    this.verticalDiffManager = verticalDiffManager;

    this._chatEventRegistry
      /**
       * Event (ready): This event is fired when the webview is ready to receive events.
       */
      .registerEvent(EventType.READY, () => {
        this._ready.fire();
        this._isReady = true;
        Telemetry.capture("ready", {});
      })

      /**
       * Event (initialized): This event is fired when the webview Chat page is initialized.
       * It is used to sync the project files with the webview.
       *
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       * @returns A promise that resolves with the initialized state.
       * @throws An error if the project files cannot be synced.
       */
      .registerEvent(EventType.INITIALIZED, async (_, sendEventMessageCb) => {
        const release = await this._initializedMutex.acquire();

        try {
          let isFigmaAuthenticated = false;

          const openWorkspace = getOpenWorkspace();
          if (!openWorkspace) {
            Telemetry.capture("workspace_not_found", {});
            return { isInitialized: false, isFigmaAuthenticated };
          }

          this._workspaceDirPath = decodeUriAndRemoveFilePrefix(openWorkspace.uri.path);
          this._assistant = new SuperflexAssistant(this._workspaceDirPath, "local", toKebabCase(openWorkspace.name));
          await this.syncProjectFiles(sendEventMessageCb);

          this._isInitialized = true;

          const session = await vscode.authentication.getSession(FIGMA_AUTH_PROVIDER_ID, []);
          if (session && session.accessToken) {
            isFigmaAuthenticated = true;
          }

          Telemetry.capture("initialized", {});

          const user = await api.getUserInfo();
          sendEventMessageCb(newEventResponse(EventType.GET_USER_INFO, user));

          const subscription = await api.getUserSubscription();
          sendEventMessageCb(newEventResponse(EventType.GET_USER_SUBSCRIPTION, subscription));

          return { isInitialized: true, isFigmaAuthenticated };
        } catch (err) {
          throw err;
        } finally {
          release();
        }
      })

      /**
       * Event (sync_project): This event is fired when the user clicks the "Sync Project" button in the webview.
       * Additionally, it is periodically triggered from the webview to ensure project files remain synchronized.
       * It is used to sync the project files with AI code assistant.
       *
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       * @returns A promise that resolves when the project files are synced.
       * @throws An error if the project files cannot be synced.
       */
      .registerEvent(EventType.SYNC_PROJECT, async (_, sendEventMessageCb) => {
        // Prevent multiple sync project requests from running concurrently
        if (!this._isInitialized || this._isSyncProjectRunning) {
          return;
        }

        this._isSyncProjectRunning = true;

        await this.syncProjectFiles(sendEventMessageCb);

        this._isSyncProjectRunning = false;
      })

      /**
       * Event (new_thread): This event is fired when the user clicks the "New Chat" button in the webview.
       * It is used to create a new chat thread with AI code assistant.
       *
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       * @returns A promise that resolves when the new chat thread is created.
       * @throws An error if the new chat thread cannot be created.
       */
      .registerEvent(EventType.NEW_THREAD, async () => {
        if (!this._isInitialized || !this._assistant) {
          return false;
        }

        this._thread = await this._assistant.createThread();

        Telemetry.capture("new_thread", {
          threadID: this._thread?.id ?? "",
        });

        return true;
      })

      /**
       * Event (figma_file_selected): This event is fired when the user selects a Figma file in the webview.
       * It is used to extract the Figma selection URL get image url and send it back to the webview.
       *
       * @param payload - Payload containing the Figma file selection URL.
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       * @returns A promise that resolves with the Figma file image URL.
       * @throws An error if the Figma file selection URL is invalid.
       */
      .registerEvent(EventType.FIGMA_FILE_SELECTED, async (payload: FigmaFile, _) => {
        if (!this._isInitialized || !this._assistant) {
          return;
        }

        const figma = extractFigmaSelectionUrl(payload.selectionLink);
        if (!figma) {
          throw new Error("Invalid figma link: Please provide a valid Figma selection url.");
        }

        const imageUrl = await getFigmaSelectionImageUrl(figma);
        return { ...payload, imageUrl, isLoading: false } as FigmaFile;
      })

      /**
       * Event (new_message): This event is fired when the user sends a message in the webview Chat.
       * It is used to send a message to the AI code assistant, and return the assistant's message response.
       *
       * @param payload - Payload containing the messages to send.
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       * @returns A promise that resolves with the assistant's message response.
       * @throws An error if the message cannot be sent or processed.
       */
      .registerEvent(EventType.NEW_MESSAGE, async (payload: SendMessagesRequestPayload, sendEventMessageCb) => {
        if (!this._isInitialized || !this._assistant) {
          return null;
        }

        const { files, messages } = payload;
        const timeNow = Date.now();
        // Do not send empty messages
        if (messages.length === 0) {
          return null;
        }

        let thread = this._thread;
        if (!thread) {
          thread = await this._assistant.createThread();
          this._thread = thread;
        }

        const threadRun = await this._assistant.sendMessage(thread.id, files, messages, (delta) => {
          sendEventMessageCb(newEventResponse(EventType.MESSAGE_TEXT_DELTA, delta));
        });
        if (!threadRun) {
          return null;
        }

        Telemetry.capture("new_message", {
          threadID: thread.id,
          customSelectedFiles: files.length,
          assistantMessageID: threadRun.message.id,
          processingDeltaTimeMs: Date.now() - timeNow,
        });

        // Send subscription prompt if user is out of premium requests
        if (!threadRun.isPremium && this._isPremiumGeneration) {
          sendEventMessageCb(newEventResponse(EventType.SHOW_SOFT_PAYWALL_MODAL));
        }
        this._isPremiumGeneration = threadRun.isPremium;

        return threadRun.message;
      })

      /**
       * Event (fast_apply): This event is used to apply the code to the file in the workspace.
       * Limited functionality for now: Only supports writing to the new file.
       *
       * @param payload - Payload containing the file path and code.
       * @returns A promise that resolves when the code is applied.
       * @throws An error if the code cannot be applied.
       */
      .registerEvent(EventType.FAST_APPLY, async (payload: FastApplyPayload) => {
        if (!this._workspaceDirPath || !this._assistant) {
          return false;
        }

        const resolvedPath = path.resolve(this._workspaceDirPath, decodeUriAndRemoveFilePrefix(payload.filePath));

        if (fs.existsSync(resolvedPath)) {
          Telemetry.capture("fast_apply_called", { createdFile: false });

          const document = await vscode.workspace.openTextDocument(resolvedPath);
          const originalCode = fs.readFileSync(resolvedPath, "utf8");

          let modifiedCode = payload.edits;
          if (originalCode !== "") {
            modifiedCode = await this._assistant.fastApply(originalCode, payload.edits);
          }

          // Create diff lines using Myers diff algorithm
          const diffLines = myersDiff(originalCode, modifiedCode);

          // Show the document
          await vscode.window.showTextDocument(document);

          // Stream the diffs
          await this.verticalDiffManager.streamDiffLines(createDiffStream(diffLines), false);
          return true;
        }

        Telemetry.capture("fast_apply_called", { createdFile: true });

        // Handle new file creation
        const directory = path.dirname(resolvedPath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }

        fs.writeFileSync(resolvedPath, "", "utf8");
        const document = await vscode.workspace.openTextDocument(resolvedPath);

        // Create diff lines using Myers diff algorithm
        const diffLines = myersDiff("", payload.edits);

        // Show the document
        await vscode.window.showTextDocument(document);

        // Stream the diffs
        await this.verticalDiffManager.streamDiffLines(createDiffStream(diffLines), true);

        return true;
      })

      /**
       * Event (fast_apply_accept): This event is used to accept all changes in the streaming fast apply.
       *
       * @param payload - Payload containing the file path.
       * @returns A promise that resolves when the changes are accepted.
       * @throws An error if the changes cannot be accepted.
       */
      .registerEvent(EventType.FAST_APPLY_ACCEPT, async (payload: { filePath: string }) => {
        if (!this._workspaceDirPath) {
          return false;
        }

        const resolvedPath = path.resolve(this._workspaceDirPath, decodeUriAndRemoveFilePrefix(payload.filePath));
        if (!fs.existsSync(resolvedPath)) {
          return false;
        }

        // Show the document first
        const document = await vscode.workspace.openTextDocument(resolvedPath);
        await vscode.window.showTextDocument(document);

        // Accept all changes in the current diff
        await this.verticalDiffManager.acceptRejectAllChanges(true, document.uri.toString());
        return true;
      })

      /**
       * Event (fast_apply_reject): This event is used to reject all changes in the streaming fast apply.
       *
       * @param payload - Payload containing the file path.
       * @returns A promise that resolves when the changes are rejected.
       * @throws An error if the changes cannot be rejected.
       */
      .registerEvent(EventType.FAST_APPLY_REJECT, async (payload: { filePath: string }) => {
        if (!this._workspaceDirPath) {
          return false;
        }

        const resolvedPath = path.resolve(this._workspaceDirPath, decodeUriAndRemoveFilePrefix(payload.filePath));
        if (!fs.existsSync(resolvedPath)) {
          return false;
        }

        // Show the document first
        const document = await vscode.workspace.openTextDocument(resolvedPath);
        await vscode.window.showTextDocument(document);

        // Reject all changes in the current diff
        await this.verticalDiffManager.acceptRejectAllChanges(false, document.uri.toString());

        const fileContent = fs.readFileSync(resolvedPath, "utf8");
        if (fileContent.trim() === "") {
          await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
          fs.unlinkSync(resolvedPath);
        }

        return true;
      })

      /**
       * Event (open_file): This event is fired when the user clicks on a file in the webview.
       * It is used to open the file in the VS Code editor.
       *
       * @param payload - Payload containing the relative file path.
       */
      .registerEvent(EventType.OPEN_FILE, async (payload: { filePath: string }) => {
        if (!this._workspaceDirPath) {
          return;
        }

        const resolvedPath = path.resolve(this._workspaceDirPath, decodeUriAndRemoveFilePrefix(payload.filePath));
        if (!fs.existsSync(resolvedPath)) {
          return;
        }

        const document = await vscode.workspace.openTextDocument(resolvedPath);
        await vscode.window.showTextDocument(document);
      })

      /**
       * Event (fetch_files): This event is fired when the webview needs to fetch the project files.
       * It is used to fetch the project files from the workspace directory.
       *
       * @returns A promise that resolves with the project files.
       * @throws An error if the project files cannot be fetched.
       */
      .registerEvent(EventType.FETCH_FILES, async () => {
        if (!this._workspaceDirPath) {
          return [];
        }

        const workspaceDirPath = this._workspaceDirPath;
        const documentPaths: string[] = await findWorkspaceFiles(workspaceDirPath, ["**/*"]);
        return documentPaths
          .sort((a, b) => {
            const statA = fs.statSync(a);
            const statB = fs.statSync(b);
            return statB.mtime.getTime() - statA.mtime.getTime();
          })
          .map((docPath) => {
            const relativePath = path.relative(workspaceDirPath, docPath);
            return {
              id: generateFileID(relativePath),
              name: path.basename(docPath),
              path: docPath,
              relativePath,
            } as FilePayload;
          });
      })

      /**
       * Event (fetch_file_content): This event is fired when the webview needs to fetch the content of a file.
       * It is used to fetch the content of a file from the workspace directory.
       *
       * @param payload - Payload containing the file path.
       * @returns A promise that resolves with the file content.
       * @throws An error if the file content cannot be fetched.
       */
      .registerEvent(EventType.FETCH_FILE_CONTENT, (payload: FilePayload) => {
        if (!this._isInitialized || !this._workspaceDirPath) {
          return "";
        }

        return fs.readFileSync(payload.path, "utf8");
      })

      /**
       * Event (update_message): This event is fired when the user provides feedback for a message in the webview Chat.
       * It is used to update the message with the feedback.
       *
       * @param payload - Payload containing the message ID and feedback.
       * @returns A promise that resolves when the message is updated.
       * @throws An error if the message cannot be updated.
       */
      .registerEvent(EventType.UPDATE_MESSAGE, async (payload: Message) => {
        if (!this._isInitialized || !this._assistant) {
          return;
        }

        await this._assistant.updateMessage(payload);
      })

      /**
       * Event (get_user_info): This event is fired when webview requests user info.
       */
      .registerEvent(EventType.GET_USER_INFO, async () => {
        if (!this._isInitialized) {
          return;
        }

        return await api.getUserInfo();
      })

      /**
       * Event (get_user_subscription): This event is fired when webview requests user subscription info.
       */
      .registerEvent(EventType.GET_USER_SUBSCRIPTION, async () => {
        if (!this._isInitialized) {
          return;
        }

        return await api.getUserSubscription();
      });
  }

  /**
   * Returns a Promise that resolves when the ChatAPI is ready.
   */
  onReady(): Promise<void> {
    if (this._isReady) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this._ready.event(resolve);
    });
  }

  /**
   * Registers a new event handler for the specified command.
   *
   * @param command - The command for which to register the event handler.
   * @param handler - The event handler to register.
   */
  registerEvent<T extends EventType>(
    command: T,
    handler: Handler<EventPayloads[T]["request"], EventPayloads[T]["response"]>
  ): void {
    this._chatEventRegistry.registerEvent(command, handler);
  }

  /**
   * Handles a chat event by delegating to the registered event handler.
   *
   * @param event - The name of the event to handle.
   * @param requestPayload - The payload of the event request.
   * @param sendEventMessageCb - A callback to send event messages to webview.
   * @return A promise that resolves to the result of the event handler.
   */
  async handleEvent<T extends EventType>(
    event: T,
    requestPayload: EventPayloads[T]["request"],
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<EventPayloads[T]["response"]> {
    return this._chatEventRegistry.handleEvent(event, requestPayload, sendEventMessageCb);
  }

  /**
   * Synchronizes project files with the assistant.
   *
   * @param sendEventMessageCb - A callback to send event messages to webview.
   * @return A promise that resolves when the synchronization is complete.
   */
  private async syncProjectFiles(sendEventMessageCb: (msg: EventMessage) => void): Promise<void> {
    if (!this._assistant) {
      return;
    }

    try {
      await this._assistant.syncFiles((progress, isFirstTimeSync) => {
        sendEventMessageCb(newEventResponse(EventType.SYNC_PROJECT_PROGRESS, { progress, isFirstTimeSync }));
      });
    } catch (err: any) {
      if (err?.statusCode === HttpStatusCode.UNAUTHORIZED) {
        throw err;
      }
      if (err?.message && err.message.startsWith("No supported files found in the workspace")) {
        vscode.window.showWarningMessage(err.message);
      }
      console.error(err);
    }
  }
}
