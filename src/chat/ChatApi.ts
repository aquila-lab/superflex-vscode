import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { Mutex } from "async-mutex";

import { Message, MessageReqest, MessageType, Thread } from "../../shared/model";
import { EventMessage, newEventRequest } from "../../shared/protocol";
import { FIGMA_AUTH_PROVIDER_ID } from "../common/constants";
import { decodeUriAndRemoveFilePrefix, getOpenWorkspace } from "../common/utils";
import { EventRegistry, Handler } from "./EventRegistry";
import { getFigmaSelectionImageUrl } from "../api";
import { extractFigmaSelectionUrl } from "../model/Figma.model";
import { Assistant } from "../assistant";
import SuperflexAssistant from "../assistant/SuperflexAssistant";

type InitState = {
  isInitialized: boolean;
  figmaAuthenticated: boolean;
};

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

  constructor() {
    this._chatEventRegistry
      /**
       * Event (ready): This event is fired when the webview is ready to receive events.
       */
      .registerEvent<void, void>("ready", () => {
        this._ready.fire();
      })

      /**
       * Event (initialized): This event is fired when the webview Chat page is initialized.
       * It is used to sync the project files with the webview.
       *
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       * @returns A promise that resolves with the initialized state.
       * @throws An error if the project files cannot be synced.
       */
      .registerEvent<void, InitState>("initialized", async (_, sendEventMessageCb) => {
        const release = await this._initializedMutex.acquire();

        try {
          let figmaAuthenticated = false;

          const openWorkspace = getOpenWorkspace();
          if (!openWorkspace) {
            return { isInitialized: false, figmaAuthenticated };
          }

          const workspaceDirPath = decodeUriAndRemoveFilePrefix(openWorkspace.uri.path);
          this._assistant = new SuperflexAssistant(workspaceDirPath, "local", openWorkspace.name);
          await this.syncProjectFiles(sendEventMessageCb);

          this._isInitialized = true;

          const session = await vscode.authentication.getSession(FIGMA_AUTH_PROVIDER_ID, []);
          if (session && session.accessToken) {
            figmaAuthenticated = true;
          }

          return { isInitialized: true, figmaAuthenticated };
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
      .registerEvent<void, void>("sync_project", async (_, sendEventMessageCb) => {
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
      .registerEvent<void, void>("new_thread", async () => {
        if (!this._isInitialized || !this._assistant) {
          return;
        }

        this._thread = await this._assistant.createThread();
      })

      /**
       * Event (new_message): This event is fired when the user sends a message in the webview Chat.
       * It is used to send a message to the AI code assistant, and return the assistant's message response.
       *
       * @param messages - Array of messages to send.
       * @param sendEventMessageCb - Callback function to send event messages to the webview.
       * @returns A promise that resolves with the assistant's message response.
       * @throws An error if the message cannot be sent or processed.
       */
      .registerEvent<MessageReqest[], Message | null>("new_message", async (messages, sendEventMessageCb) => {
        if (!this._isInitialized || !this._assistant) {
          return null;
        }

        messages = await Promise.all(
          messages.map(async (msg) => {
            if (msg.type === MessageType.Image) {
              // Read the image file
              const imageData = fs.readFileSync(path.resolve(msg.content));
              const base64Image = Buffer.from(imageData).toString("base64");

              return {
                ...msg,
                content: base64Image,
              };
            }
            if (msg.type === MessageType.Figma) {
              const figma = extractFigmaSelectionUrl(msg.content);
              if (!figma) {
                vscode.window.showErrorMessage("Invalid figma link: Please provide a valid Figma selection url.");
                throw new Error("Invalid figma link");
              }

              const imageUrl = await getFigmaSelectionImageUrl(figma);
              return {
                ...msg,
                content: imageUrl,
              };
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

        const assistantMessage = await this._assistant.sendMessage(thread.id, messages, (event) => {
          sendEventMessageCb(newEventRequest("message_processing", event.value));
        });

        return assistantMessage;
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
   * @param {string} command - The command for which to register the event handler.
   * @param {Handler<Req, Res>} handler - The event handler to register.
   */
  registerEvent<Req, Res>(command: string, handler: Handler<Req, Res>): void {
    this._chatEventRegistry.registerEvent<Req, Res>(command, handler);
  }

  /**
   * Handles a chat event by delegating to the registered event handler.
   *
   * @param {string} event - The name of the event to handle.
   * @param {Req} requestPayload - The payload of the event request.
   * @param {(msg: EventMessage) => void} sendEventMessageCb - A callback to send event messages to webview.
   * @return {Promise<Res>} A promise that resolves to the result of the event handler.
   */
  handleEvent<Req, Res>(
    event: string,
    requestPayload: Req,
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<Res> {
    return this._chatEventRegistry.handleEvent(event, requestPayload, sendEventMessageCb);
  }

  /**
   * Synchronizes project files with the assistant.
   *
   * @param {(msg: EventMessage) => void} sendEventMessageCb - A callback to send event messages to webview.
   * @return {Promise<void>} A promise that resolves when the synchronization is complete.
   */
  private async syncProjectFiles(sendEventMessageCb: (msg: EventMessage) => void): Promise<void> {
    if (!this._assistant) {
      return;
    }

    try {
      await this._assistant.syncFiles((progress) => {
        sendEventMessageCb(newEventRequest("sync_progress", { progress }));
      });
    } catch (err: any) {
      if (err?.message && err.message.startsWith("No supported files found in the workspace")) {
        vscode.window.showWarningMessage(err.message);
      }
      console.error(err);
    }
  }
}
