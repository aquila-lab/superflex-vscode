import * as vscode from "vscode";
import { ColorThemeKind } from "vscode";

import { sendEvent } from "../binary/requests/sendEvent";
import { GET_CHAT_STATE_COMMAND } from "../utils/consts";
import { EventRegistry } from "./EventRegistry";

type SendEventRequest = {
  eventName: string;
  properties?: { [key: string]: string };
};

type ChatMessageProps = {
  text: string;
  isBot: boolean;
  timestamp: string;
};

type ChatConversation = {
  id: string;
  messages: ChatMessageProps[];
};

type ChatState = {
  conversations: { [id: string]: ChatConversation };
};

type InitResponse = {
  ide: string;
  isDarkTheme: boolean;
  serverUrl?: string;
};

type APIConfig = {
  serverUrl?: string | undefined;
};

const CHAT_CONVERSATIONS_KEY = "CHAT_CONVERSATIONS";

export class ChatAPI {
  private ready = new vscode.EventEmitter<void>();

  private chatEventRegistry = new EventRegistry();

  public onReady = new Promise((resolve) => {
    this.ready.event(resolve);
  });

  constructor(context: vscode.ExtensionContext, config: APIConfig) {
    if (process.env.IS_EVAL_MODE === "true") {
      context.subscriptions.push(
        vscode.commands.registerCommand(
          GET_CHAT_STATE_COMMAND,
          () =>
            context.globalState.get(CHAT_CONVERSATIONS_KEY, {
              conversations: {},
            }) as ChatState
        )
      );
    }

    this.chatEventRegistry
      .registerEvent<void, InitResponse>("init", async () => {
        this.ready.fire();
        return Promise.resolve({
          ide: "vscode",
          isDarkTheme: [
            ColorThemeKind.HighContrast,
            ColorThemeKind.Dark,
          ].includes(vscode.window.activeColorTheme.kind),
          ...config,
        });
      })
      .registerEvent<SendEventRequest, void>(
        "send_event",
        async (req: SendEventRequest) => {
          await sendEvent({
            name: req.eventName,
            properties: req.properties,
          });
        }
      )
      .registerEvent<ChatConversation, void>(
        "update_chat_conversation",
        async (conversation: ChatConversation) => {
          const chatState = context.globalState.get(CHAT_CONVERSATIONS_KEY, {
            conversations: {},
          }) as ChatState;
          chatState.conversations[conversation.id] = {
            id: conversation.id,
            messages: conversation.messages,
          };
          await context.globalState.update(CHAT_CONVERSATIONS_KEY, chatState);
        }
      )
      .registerEvent<void, ChatState>(
        "get_chat_state",
        () =>
          context.globalState.get(CHAT_CONVERSATIONS_KEY, {
            conversations: {},
          }) as ChatState
      )
      .registerEvent<void, void>("clear_all_chat_conversations", async () =>
        context.globalState.update(CHAT_CONVERSATIONS_KEY, {
          conversations: {},
        })
      );
  }

  async handleEvent<Req, Res>(
    event: string,
    requestPayload: Req
  ): Promise<Res> {
    return this.chatEventRegistry.handleEvent(event, requestPayload);
  }
}
