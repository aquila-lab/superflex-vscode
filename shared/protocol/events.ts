import { v4 as uuidv4 } from "uuid";
import { Message, MessageReqest } from "../model";
import { FilePayload, InitState, SyncProjectProgressPayload } from "./types";

export enum EventType {
  READY = "ready",
  INITIALIZED = "initialized",

  // Login events
  LOGIN_CLICKED = "login_clicked",

  // Project events
  SYNC_PROJECT = "sync_project",
  SYNC_PROJECT_PROGRESS = "sync_project_progress",

  // Figma events
  FIGMA_OAUTH_CONNECT = "figma_oauth_connect",
  FIGMA_OAUTH_DISCONNECT = "figma_oauth_disconnect",

  // Chat events
  NEW_THREAD = "new_thread",
  NEW_MESSAGE = "new_message",
  ADD_MESSAGE = "add_message",
  FETCH_FILES = "fetch_files",

  // Commands that are sent from the extension to the webview usually to trigger an action
  CMD_NEW_THREAD = "cmd_new_thread",
  CMD_SYNC_PROJECT = "cmd_sync_project",

  // Views
  SHOW_LOGIN_VIEW = "show_login_view",
  SHOW_CHAT_VIEW = "show_chat_view",
}

export interface EventPayloads {
  [EventType.READY]: { request: void; response: void };
  [EventType.INITIALIZED]: { request: void; response: InitState };
  [EventType.LOGIN_CLICKED]: { request: void; response: void };
  [EventType.SYNC_PROJECT]: { request: void; response: void };
  [EventType.SYNC_PROJECT_PROGRESS]: { request: void; response: SyncProjectProgressPayload };
  [EventType.FIGMA_OAUTH_CONNECT]: { request: void; response: boolean };
  [EventType.FIGMA_OAUTH_DISCONNECT]: { request: void; response: void };
  [EventType.NEW_THREAD]: { request: void; response: void };
  [EventType.NEW_MESSAGE]: { request: MessageReqest[]; response: Message | null };
  [EventType.ADD_MESSAGE]: { request: void; response: Message };
  [EventType.FETCH_FILES]: { request: void; response: FilePayload[] };
  [EventType.CMD_NEW_THREAD]: { request: void; response: void };
  [EventType.CMD_SYNC_PROJECT]: { request: void; response: void };
  [EventType.SHOW_LOGIN_VIEW]: { request: void; response: void };
  [EventType.SHOW_CHAT_VIEW]: { request: void; response: void };
}

export type EventCallback<T extends EventType> = (payload: EventPayloads[T]["response"]) => void;

export interface EventMessage<T extends EventType = EventType> {
  id: string;
  command: T;
  payload?: EventPayloads[T]["request"] | EventPayloads[T]["response"];
  error?: string;
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
