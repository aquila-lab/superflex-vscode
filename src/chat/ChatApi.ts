import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { Mutex } from "async-mutex";
import { v4 as uuidv4 } from "uuid";

import { EventMessage, newEventMessage } from "../protocol";
import { SuperflexCache } from "../cache/SuperflexCache";
import { FIGMA_AUTH_PROVIDER_ID } from "../common/constants";
import { decodeUriAndRemoveFilePrefix, getOpenWorkspace } from "../common/utils";
import { EventRegistry, Handler } from "./EventRegistry";
import { downloadImage, getFigmaSelectionFileNodes, getFigmaSelectionImageUrl } from "../api";
import { parseFigmaResponse } from "../core/Figma.model";
import { Assistant } from "../assistant";
import SuperflexAssistant from "../assistant/SuperflexAssistant";
import MockAssistant from "../assistant/MockAssistant";

type InitState = {
  isInitialized: boolean;
  figmaAuthenticated: boolean;
};

/**
 * ChatAPI class for interacting with the chat service.
 */
export class ChatAPI {
  private _assistant: Assistant;
  private _ready = new vscode.EventEmitter<void>();
  private _isInitialized = false;
  private _initializedMutex = new Mutex();
  private _chatEventRegistry = new EventRegistry();
  private _isSyncProjectRunning = false;

  constructor() {
    this._assistant = new MockAssistant();

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
        await this._assistant.createThread();
      })
      .registerEvent<NewMessageRequest, Message[]>("new_message", async (req, sendEventMessageCb) => {
        if (!this._isInitialized || !this._assistant) {
          return [];
        }

        const messagesReq: MessageContent[] = [];
        if (req.text) {
          messagesReq.push({ type: "text", text: req.text });
        }
        if (req.imageUrl) {
          messagesReq.push({ type: "image_file", imageUrl: req.imageUrl });
        }
        if (req.figma) {
          const imageUrl = await getFigmaSelectionImageUrl(req.figma);

          sendEventMessageCb(
            newEventMessage("add_message", {
              id: uuidv4(),
              text: "Processing figma file...",
              sender: "bot",
              imageUrl,
            } as ChatMessage)
          );

          if (SuperflexCache.storagePath) {
            const imageUrlSegments = imageUrl.split("/");
            const imageFileDir = decodeUriAndRemoveFilePrefix(path.join(SuperflexCache.storagePath, "images"));
            if (!fs.existsSync(imageFileDir)) {
              fs.mkdirSync(imageFileDir, { recursive: true });
            }

            const imageFilePath = decodeUriAndRemoveFilePrefix(
              path.join(imageFileDir, `${imageUrlSegments[imageUrlSegments.length - 1]}.png`)
            );
            await downloadImage(imageUrl, imageFilePath);
            messagesReq.push({ type: "image_file", imageUrl: imageFilePath });
          }

          const fileNodes = await getFigmaSelectionFileNodes(req.figma);

          messagesReq.push({
            type: "figma",
            content: `
Convert this Figma JSON object into production ready code following assistent instructions.

## Figma JSON
${JSON.stringify(parseFigmaResponse(fileNodes))}
## constraints
- Analyze the provided image to get better understending of the design we are trying to achieve
- When it comes to styling, use the provided figma json object there you can find all the necessary information
- Do not omit any details in JSX
- Do not write anything besides code
- If a layer contains more than 1 same name child layers, define it with ul tag and create array of appropriate dummy data within React component and use map method to render in JSX
- Avoid using absolute positioning in CSS focus on flexbox and grid
- Do not forget to follow instructions from the assistant
- Generate the component code following the repository's coding style, design patterns, and reusing existing components.
- Strong focus on readability existing compoenents 
`,
          });
        }

        // Do not send empty messages
        if (messagesReq.length === 0) {
          return [];
        }

        const messages = await this._assistant.sendMessage(messagesReq, (event) => {
          sendEventMessageCb(newEventMessage("message_processing", event.value));
        });
        return messages;
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
    try {
      await this._assistant.syncFiles((progress) => {
        sendEventMessageCb(newEventMessage("sync_progress", { progress }));
      });
    } catch (err: any) {
      if (err?.message && err.message.startsWith("No supported files found in the workspace")) {
        vscode.window.showWarningMessage(err.message);
      }
      console.error(err);
    }
  }
}
