import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { Mutex } from "async-mutex";

import { Message, MessageType, Thread, User, UserSubscription } from "../../shared/model";
import {
  EventMessage,
  EventPayloads,
  EventType,
  FigmaFile,
  newEventResponse,
  SendMessagesRequestPayload,
} from "../../shared/protocol";
import * as api from "../api";
import { FIGMA_AUTH_PROVIDER_ID } from "../common/constants";
import { decodeUriAndRemoveFilePrefix, getOpenWorkspace, toKebabCase } from "../common/utils";
import { Telemetry } from "../common/analytics/Telemetry";
import { EventRegistry, Handler } from "./EventRegistry";
import { getFigmaSelectionImageUrl, HttpStatusCode } from "../api";
import { extractFigmaSelectionUrl } from "../model/Figma.model";
import { Assistant } from "../assistant";
import SuperflexAssistant from "../assistant/SuperflexAssistant";
import { findWorkspaceFiles } from "../scanner";

/**
 * ChatAPI class for interacting with the chat service.
 */
export class ChatAPI {
  private _assistant?: Assistant;
  private _ready = new vscode.EventEmitter<void>();
  private _isInitialized = false;
  private _initializedMutex = new Mutex();
  private _chatEventRegistry = new EventRegistry();
  private _isSyncProjectRunning = false;
  private _thread?: Thread;
  private _workspaceDirPath?: string;
  private _isPremiumGeneration = true;

  constructor() {
    this._chatEventRegistry
      /**
       * Event (ready): This event is fired when the webview is ready to receive events.
       */
      .registerEvent(EventType.READY, () => {
        this._ready.fire();

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
          return;
        }

        this._thread = await this._assistant.createThread();

        Telemetry.capture("new_thread", {
          threadID: this._thread?.id ?? "",
        });
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

        const timeNow = Date.now();

        const messages = await Promise.all(
          payload.messages.map(async (msg) => {
            if (msg.type === MessageType.Image) {
              // Read the image file
              const imageData = fs.readFileSync(path.resolve(msg.content));
              const base64Image = Buffer.from(imageData).toString("base64");

              return { ...msg, content: base64Image };
            }
            if (msg.type === MessageType.Figma) {
              return { ...msg, type: MessageType.Image };
            }

            return msg;
          })
        );

        // Do not send empty messages
        if (messages.length === 0) {
          return null;
        }

        let thread = this._thread;
        if (!thread) {
          thread = await this._assistant.createThread();
          this._thread = thread;
        }

        const threadRun = await this._assistant.sendMessage(thread.id, payload.files, messages);

        Telemetry.capture("new_message", {
          threadID: thread.id,
          customSelectedFiles: payload.files.length,
          assistantMessageID: threadRun.message.id,
          assistantMessageLength: threadRun.message.content.length,
          processingDeltaTimeMs: Date.now() - timeNow,
        });

        // Send subscription prompt if user is out of premium requests
        if (!threadRun.isPremium && this._isPremiumGeneration) {
          vscode.window.showWarningMessage(
            "You have used up your free credits for today. Please upgrade to Superflex Premium to continue."
          );
        }
        this._isPremiumGeneration = threadRun.isPremium;

        return threadRun.message;
      })

      /**
       * Event (fetch_files): This event is fired when the webview needs to fetch the project files.
       * It is used to fetch the project files from the workspace directory.
       *
       * @returns A promise that resolves with the project files.
       * @throws An error if the project files cannot be fetched.
       */
      .registerEvent(EventType.FETCH_FILES, async () => {
        if (!this._isInitialized || !this._assistant || !this._workspaceDirPath) {
          return [];
        }

        const workspaceDirPath = this._workspaceDirPath;
        const documentPaths: string[] = await findWorkspaceFiles(workspaceDirPath);
        return documentPaths
          .sort((a, b) => {
            const statA = fs.statSync(a);
            const statB = fs.statSync(b);
            return statB.mtime.getTime() - statA.mtime.getTime();
          })
          .map((docPath) => ({
            name: path.basename(docPath),
            path: docPath,
            relativePath: path.relative(workspaceDirPath, docPath),
          }));
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
