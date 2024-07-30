import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { Mutex } from "async-mutex";
import { v4 as uuidv4 } from "uuid";

import { findFiles } from "../scanner";
import { EventMessage, newEventMessage } from "../protocol";
import { ElementAICache } from "../cache/ElementAICache";
import { FIGMA_AUTH_PROVIDER_ID, SUPPORTED_FILE_EXTENSIONS } from "../common/constants";
import { AIProvider, Assistant, Message, MessageContent, VectorStore } from "../providers/AIProvider";
import { decodeUriAndRemoveFilePrefix, getOpenWorkspace } from "../common/utils";
import { EventRegistry, Handler } from "./EventRegistry";
import { downloadImage, getFigmaSelectionFileNodes, getFigmaSelectionImageUrl } from "../api";
import { parseFigmaResponse } from "../core/Figma.model";

const SETTINGS_FILE = "settings.json";

type Settings = {
  vectorStoreID: string;
  assistantID: string;
};

type InitState = {
  isInitialized: boolean;
  figmaAuthenticated: boolean;
};

type NewMessageRequest = {
  text?: string;
  imageUrl?: string;
  figma?: {
    fileID: string;
    nodeID: string;
  };
};

type ChatMessage = {
  id: string;
  text: string;
  sender: "user" | "bot";
  imageUrl?: string;
};

export class ChatAPI {
  private _aiProvider: AIProvider;
  private _ready = new vscode.EventEmitter<void>();
  private _isInitialized = false;
  private _initializedMutex = new Mutex();
  private _chatEventRegistry = new EventRegistry();
  private _isSyncProjectRunning = false;

  private _vectorStore?: VectorStore;
  private _assistant?: Assistant;

  constructor(aiProvider: AIProvider) {
    this._aiProvider = aiProvider;

    this._chatEventRegistry
      .registerEvent<void, void>("ready", () => {
        this._ready.fire();
      })
      .registerEvent<void, InitState>("initialized", async (_, sendEventMessageCb) => {
        const release = await this._initializedMutex.acquire();

        try {
          let figmaAuthenticated = false;

          await this._aiProvider.init();

          const openWorkspace = getOpenWorkspace();
          if (!openWorkspace) {
            return { isInitialized: false, figmaAuthenticated };
          }

          await this.initializeAssistant(openWorkspace.name);
          await this.syncProjectFiles(openWorkspace, sendEventMessageCb);

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
      .registerEvent<void, void>("sync_project", async (_, sendEventMessageCb) => {
        // Prevent multiple sync project requests from running concurrently
        if (!this._isInitialized || this._isSyncProjectRunning) {
          return;
        }
        this._isSyncProjectRunning = true;

        const openWorkspace = getOpenWorkspace();
        if (!openWorkspace) {
          return;
        }
        await this.syncProjectFiles(openWorkspace, sendEventMessageCb);

        this._isSyncProjectRunning = false;
      })
      .registerEvent<void, void>("new_thread", async () => {
        if (!this._isInitialized || !this._assistant) {
          return;
        }
        await this._assistant.createNewThread();
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

          if (ElementAICache.storagePath) {
            const imageUrlSegments = imageUrl.split("/");
            const imageFileDir = decodeUriAndRemoveFilePrefix(path.join(ElementAICache.storagePath, "images"));
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

  onReady(): Promise<void> {
    return new Promise((resolve) => {
      this._ready.event(resolve);
    });
  }

  registerEvent<Req, Res>(command: string, handler: Handler<Req, Res>): void {
    this._chatEventRegistry.registerEvent<Req, Res>(command, handler);
  }

  handleEvent<Req, Res>(
    event: string,
    requestPayload: Req,
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<Res> {
    return this._chatEventRegistry.handleEvent(event, requestPayload, sendEventMessageCb);
  }

  private async initializeAssistant(workspaceName: string): Promise<void> {
    const rawSettings = ElementAICache.get(SETTINGS_FILE);
    if (rawSettings) {
      const settings = JSON.parse(rawSettings) as Settings;
      if (settings.vectorStoreID && settings.assistantID) {
        this._vectorStore = await this._aiProvider.retrieveVectorStore(settings.vectorStoreID);
        this._assistant = await this._aiProvider.retrieveAssistant(settings.assistantID);
        return;
      }
    }

    this._vectorStore = await this._aiProvider.createVectorStore(workspaceName);
    this._assistant = await this._aiProvider.createAssistant(this._vectorStore);

    ElementAICache.set(
      SETTINGS_FILE,
      JSON.stringify({ vectorStoreID: this._vectorStore.id, assistantID: this._assistant.id } as Settings)
    );
  }

  private async syncProjectFiles(
    openWorkspace: vscode.WorkspaceFolder,
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<void> {
    const workspaceFolderPath = decodeUriAndRemoveFilePrefix(openWorkspace.uri.path);
    const documentsUri: string[] = await findFiles(
      workspaceFolderPath,
      SUPPORTED_FILE_EXTENSIONS.map((ext) => `**/*${ext}`),
      ["**/node_modules/**", "**/build/**", "**/out/**", "**/dist/**"]
    );

    if (documentsUri.length === 0) {
      vscode.window.showWarningMessage(
        `No supported files found in the workspace.\nSupported file extensions are: ${SUPPORTED_FILE_EXTENSIONS}`
      );
    }

    await this._vectorStore?.syncFiles(documentsUri, (progress) => {
      sendEventMessageCb(newEventMessage("sync_progress", { progress }));
    });
  }
}
