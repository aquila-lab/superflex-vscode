import { v4 as uuidv4 } from "uuid";
import { Message, User, UserSubscription } from "../model";
import {
  AuthLinkPayload,
  CreateAuthLinkPayload,
  FigmaFile,
  FilePayload,
  InitState,
  SendMessagesRequestPayload,
  SendNotificationPayload,
  SyncProjectProgressPayload,
} from "./types";

export enum EventType {
  READY = "ready",
  INITIALIZED = "initialized",

  // Login events
  LOGIN_CLICKED = "login_clicked",
  CREATE_ACCOUNT_CLICKED = "create_account_clicked",
  CREATE_AUTH_LINK = "create_auth_link",

  // Project events
  SYNC_PROJECT = "sync_project",
  SYNC_PROJECT_PROGRESS = "sync_project_progress",

  // Figma events
  FIGMA_OAUTH_CONNECT = "figma_oauth_connect",
  FIGMA_OAUTH_DISCONNECT = "figma_oauth_disconnect",
  FIGMA_FILE_SELECTED = "figma_file_selected",

  // Chat events
  NEW_THREAD = "new_thread",
  NEW_MESSAGE = "new_message",
  UPDATE_MESSAGE = "update_message",
  FETCH_FILES = "fetch_files",
  SET_CURRENT_OPEN_FILE = "set_current_open_file",

  // Commands that are sent from the extension to the webview usually to trigger an action
  CMD_NEW_THREAD = "cmd_new_thread",
  CMD_SYNC_PROJECT = "cmd_sync_project",

  // Views
  SHOW_LOGIN_VIEW = "show_login_view",
  SHOW_CHAT_VIEW = "show_chat_view",

  // User events
  GET_USER_INFO = "get_user_info",
  GET_USER_SUBSCRIPTION = "get_user_subscription",

  // Helpers
  SEND_NOTIFICATION = "send_notification",
  OPEN_EXTERNAL_URL = "open_external_url",
  SHOW_SOFT_PAYWALL_MODAL = "show_soft_paywall_modal",
}

export interface EventPayloads {
  [EventType.READY]: { request: void; response: void };
  [EventType.INITIALIZED]: { request: void; response: InitState };
  [EventType.LOGIN_CLICKED]: { request: void; response: void };
  [EventType.CREATE_ACCOUNT_CLICKED]: { request: void; response: void };
  [EventType.CREATE_AUTH_LINK]: { request: CreateAuthLinkPayload; response: AuthLinkPayload };
  [EventType.SYNC_PROJECT]: { request: void; response: void };
  [EventType.SYNC_PROJECT_PROGRESS]: { request: void; response: SyncProjectProgressPayload };
  [EventType.FIGMA_OAUTH_CONNECT]: { request: void; response: boolean };
  [EventType.FIGMA_OAUTH_DISCONNECT]: { request: void; response: void };
  [EventType.FIGMA_FILE_SELECTED]: { request: FigmaFile; response: FigmaFile };
  [EventType.NEW_THREAD]: { request: void; response: void };
  [EventType.NEW_MESSAGE]: { request: SendMessagesRequestPayload; response: Message | null };
  [EventType.UPDATE_MESSAGE]: { request: Message; response: Message | null };
  [EventType.FETCH_FILES]: { request: void; response: FilePayload[] };
  [EventType.SET_CURRENT_OPEN_FILE]: { request: FilePayload | null; response: void };
  [EventType.CMD_NEW_THREAD]: { request: void; response: void };
  [EventType.CMD_SYNC_PROJECT]: { request: void; response: void };
  [EventType.SHOW_LOGIN_VIEW]: { request: void; response: void };
  [EventType.SHOW_CHAT_VIEW]: { request: void; response: void };
  [EventType.GET_USER_INFO]: { request: void; response: User };
  [EventType.GET_USER_SUBSCRIPTION]: { request: void; response: UserSubscription };
  [EventType.SEND_NOTIFICATION]: { request: SendNotificationPayload; response: void };
  [EventType.OPEN_EXTERNAL_URL]: { request: { url: string }; response: void };
  [EventType.SHOW_SOFT_PAYWALL_MODAL]: { request: void; response: void };
}

export type EventCallback<T extends EventType> = (payload: EventPayloads[T]["response"]) => void;

export interface EventMessage<T extends EventType = EventType> {
  id: string;
  command: T;
  payload?: EventPayloads[T]["request"] | EventPayloads[T]["response"];
  error?: Error;
}

export function newEventRequest<T extends EventType>(
  command: T,
  payload?: EventPayloads[T]["request"]
): EventMessage<T> {
  return { id: uuidv4(), command, payload };
}

export function newEventResponse<T extends EventType>(
  command: T,
  payload?: EventPayloads[T]["response"]
): EventMessage<T> {
  return { id: uuidv4(), command, payload };
}
