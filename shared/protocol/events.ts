import { v4 as uuidv4 } from "uuid";
import { Message, TextDelta, Thread, User, UserSubscription } from "../model";
import {
  AuthLinkPayload,
  ConfigPayload,
  CreateAuthLinkPayload,
  FastApplyPayload,
  FigmaFile,
  FilePayload,
  InitChatState,
  SendMessagesRequestPayload,
  SendNotificationPayload,
  SyncProjectProgressPayload,
} from "./types";

/**
 * @enum {EventRequestType} is a list of events that we are sending from the webview to the extension.
 * These events are sent as requests and are expected to be handled by the extension.
 */
export enum EventRequestType {
  // ---------------- SYSTEM EVENTS ----------------

  /**
   * READY is used to indicate that the webview is ready to receive messages.
   */
  READY = "ready",

  /**
   * INITIALIZED is used to indicate that the chat webview is initialized.
   * @returns {InitChatState}
   */
  INITIALIZED = "initialized",

  // ---------------- LOGIN EVENTS ----------------

  /**
   * LOGIN will trigger the login flow on the extension.
   */
  LOGIN = "login",

  /**
   * CREATE_ACCOUNT will trigger the create account flow on the extension.
   */
  CREATE_ACCOUNT = "create_account",

  /**
   * CREATE_AUTH_LINK will create an auth link for the user to login or create an account.
   * @returns {AuthLinkPayload}
   */
  CREATE_AUTH_LINK = "create_auth_link",

  // ---------------- USER EVENTS ----------------

  /**
   * GET_USER_INFO will request user info from the extension.
   * @returns {User}
   */
  GET_USER_INFO = "get_user_info",

  /**
   * GET_USER_SUBSCRIPTION will request user subscription from the extension.
   * @returns {UserSubscription}
   */
  GET_USER_SUBSCRIPTION = "get_user_subscription",

  // ---------------- PROJECT EVENTS ----------------

  /**
   * SYNC_PROJECT will trigger the project sync flow on the extension.
   */
  SYNC_PROJECT = "sync_project",

  // ---------------- FIGMA EVENTS ----------------

  /**
   * FIGMA_OAUTH_CONNECT will trigger the Figma OAuth flow on the extension.
   * @returns {boolean} indicating if the authentification was successful.
   */
  FIGMA_OAUTH_CONNECT = "figma_oauth_connect",

  /**
   * FIGMA_OAUTH_DISCONNECT will disconnect the Figma account from the extension.
   */
  FIGMA_OAUTH_DISCONNECT = "figma_oauth_disconnect",

  /**
   * FIGMA_FILE_SELECTED will send Figma selection link to the extension.
   * @returns {FigmaFile} with image url.
   */
  FIGMA_FILE_SELECTED = "figma_file_selected",

  // ---------------- CHAT EVENTS ----------------

  /**
   * NEW_THREAD will trigger the new thread creation on the extension.
   * @returns {Thread}
   */
  NEW_THREAD = "new_thread",

  /**
   * FETCH_THREADS will request all threads from the extension.
   * @returns {Thread[]}
   */
  FETCH_THREADS = "fetch_threads",

  /**
   * FETCH_THREAD will request a specific thread from the extension.
   * @returns {Thread}
   */
  FETCH_THREAD = "fetch_thread",

  /**
   * STOP_MESSAGE will stop the message stream.
   */
  STOP_MESSAGE = "stop_message",

  /**
   * SEND_MESSAGE will send a message to the extension for processing.
   * @returns {Message}
   */
  SEND_MESSAGE = "send_message",

  /**
   * UPDATE_MESSAGE will send updated message to the extension.
   */
  UPDATE_MESSAGE = "update_message",

  /**
   * FAST_APPLY trigger extension to start applying changes from the chat file to given file in user project.
   * @returns {boolean} indicating if the fast apply was successful.
   */
  FAST_APPLY = "fast_apply",

  /**
   * FAST_APPLY_ACCEPT trigger extension to accept all merge changes that we made using fast apply for the given file.
   */
  FAST_APPLY_ACCEPT = "fast_apply_accept",

  /**
   * FAST_APPLY_REJECT trigger extension to reject all merge changes that we made using fast apply for the given file.
   */
  FAST_APPLY_REJECT = "fast_apply_reject",

  // ---------------- FILE EVENTS ----------------

  /**
   * OPEN_FILE trigger extension to open the given file in the IDE.
   */
  OPEN_FILE = "open_file",

  /**
   * FETCH_FILES trigger extension to fetch the project files from the workspace directory.
   * @returns {FilePayload[]}
   */
  FETCH_FILES = "fetch_files",

  /**
   * FETCH_FILE_CONTENT trigger extension to fetch the content of the given file.
   * @returns {string} file content
   */
  FETCH_FILE_CONTENT = "fetch_file_content",

  /**
   * FETCH_CURRENT_OPEN_FILE trigger extension to fetch the current open file.
   * @returns {FilePayload | null} can be null if no file is open.
   */
  FETCH_CURRENT_OPEN_FILE = "fetch_current_open_file",

  /**
   * PASTE_COPIED_CODE trigger extension to return FilePayload of selected text if it is part of the user project.
   * @returns {FilePayload | null}
   */
  PASTE_COPIED_CODE = "paste_copied_code",

  // ---------------- HELPER EVENTS ----------------

  /**
   * OPEN_EXTERNAL_URL will open an external URL in the user's browser.
   */
  OPEN_EXTERNAL_URL = "open_external_url",

  /**
   * SEND_NOTIFICATION will send a notification to IDE.
   */
  SEND_NOTIFICATION = "send_notification",
}

/**
 * @enum {EventResponseType} is a list of events that we are sending from the extension to the webview.
 * These events are sent as responses and are expected to be handled by the webview.
 */
export enum EventResponseType {
  // ---------------- SYSTEM EVENTS ----------------

  /**
   * @triggered by extension.
   * CONFIG is used to send the extension config to the webview.
   */
  CONFIG = "config",

  /**
   * @triggered by {EventRequestType.INITIALIZED}
   * INITIALIZED is used to send the initialized state to the webview.
   */
  INITIALIZED = "initialized",

  // ---------------- LOGIN EVENTS ----------------

  /**
   * @triggered by {EventRequestType.CREATE_AUTH_LINK}
   * CREATE_AUTH_LINK is used to send the created auth link to the webview.
   */
  CREATE_AUTH_LINK = "create_auth_link",

  // ---------------- USER EVENTS ----------------

  /**
   * @triggered by {EventRequestType.GET_USER_INFO}
   * GET_USER_INFO is used to send the user info to the webview.
   */
  GET_USER_INFO = "get_user_info",

  /**
   * @triggered by {EventRequestType.GET_USER_SUBSCRIPTION}
   * GET_USER_SUBSCRIPTION is used to send the user subscription to the webview.
   */
  GET_USER_SUBSCRIPTION = "get_user_subscription",

  // ---------------- PROJECT EVENTS ----------------

  /**
   * @triggered by {EventRequestType.SYNC_PROJECT}
   * SYNC_PROJECT_PROGRESS is used to stream the project sync progress to the webview.
   */
  SYNC_PROJECT_PROGRESS = "sync_project_progress",

  // ---------------- FIGMA EVENTS ----------------

  /**
   * @triggered by {EventRequestType.FIGMA_OAUTH_CONNECT}
   * FIGMA_OAUTH_CONNECT will send boolean indicating if the Figma OAuth flow was successful.
   */
  FIGMA_OAUTH_CONNECT = "figma_oauth_connect",

  /**
   * @triggered by extension.
   * FIGMA_OAUTH_DISCONNECT means the Figma token was deleted from the extension.
   */
  FIGMA_OAUTH_DISCONNECT = "figma_oauth_disconnect",

  /**
   * @triggered by {EventRequestType.FIGMA_FILE_SELECTED}
   * FIGMA_FILE_SELECTED will send the Figma selection image to the webview.
   */
  FIGMA_FILE_SELECTED = "figma_file_selected",

  // ---------------- CHAT EVENTS ----------------

  /**
   * @triggered by {EventRequestType.NEW_THREAD}
   * NEW_THREAD is used to indicate that a new thread was created.
   */
  NEW_THREAD = "new_thread",

  /**
   * @triggered by {EventRequestType.FETCH_THREADS}
   * FETCH_THREADS will send all threads to the webview.
   */
  FETCH_THREADS = "fetch_threads",

  /**
   * @triggered by {EventRequestType.FETCH_THREAD}
   * FETCH_THREAD will send the requested thread to the webview.
   */
  FETCH_THREAD = "fetch_thread",

  /**
   * @triggered by {EventRequestType.SEND_MESSAGE}
   * SEND_MESSAGE send message response to the webview.
   */
  SEND_MESSAGE = "send_message",

  /**
   * @triggered by {EventRequestType.SEND_MESSAGE}
   * MESSAGE_TEXT_DELTA is used to stream the response message text delta to the webview before the message is fully sent with SEND_MESSAGE event.
   */
  MESSAGE_TEXT_DELTA = "message_text_delta",

  /**
   * @triggered by {EventRequestType.FAST_APPLY}
   * FAST_APPLY is used to send the fast apply response to the webview.
   */
  FAST_APPLY = "fast_apply",

  /**
   * @triggered by extension.
   * FOCUS_CHAT_INPUT will focus the chat input field in the webview.
   */
  FOCUS_CHAT_INPUT = "focus_chat_input",

  // ---------------- FILE EVENTS ----------------

  /**
   * @triggered by {EventRequestType.FETCH_FILES}
   * FETCH_FILES will send the all project files from the workspace directory to the webview.
   */
  FETCH_FILES = "fetch_files",

  /**
   * @triggered by {EventRequestType.FETCH_FILE_CONTENT}
   * FETCH_FILE_CONTENT will send the content of the given file to the webview.
   */
  FETCH_FILE_CONTENT = "fetch_file_content",

  /**
   * @triggered by {EventRequestType.FETCH_CURRENT_OPEN_FILE}.
   * FETCH_CURRENT_OPEN_FILE will send the current open file to the webview, if no file is open, it will send null.
   */
  FETCH_CURRENT_OPEN_FILE = "fetch_current_open_file",

  /**
   * @triggered by extension.
   * SET_CURRENT_OPEN_FILE will send the current open file in IDE to the webview.
   */
  SET_CURRENT_OPEN_FILE = "set_current_open_file",

  /**
   * @triggered by extension.
   * ADD_SELECTED_CODE will add the selected code to the chat.
   */
  ADD_SELECTED_CODE = "add_selected_code",

  /**
   * @triggered by {EventRequestType.PASTE_COPIED_CODE}
   * PASTE_COPIED_CODE will paste the copied code to the chat.
   */
  PASTE_COPIED_CODE = "paste_copied_code",

  // ---------------- VIEWS ----------------

  /**
   * @triggered by extension.
   * SHOW_LOGIN_VIEW will show the login view on the webview.
   */
  SHOW_LOGIN_VIEW = "show_login_view",

  /**
   * @triggered by extension.
   * SHOW_CHAT_VIEW will show the chat view on the webview.
   */
  SHOW_CHAT_VIEW = "show_chat_view",

  // ---------------- COMMANDS ----------------

  /**
   * @triggered by extension.
   * CMD_NEW_THREAD will trigger the new thread creation on the webview.
   */
  CMD_NEW_THREAD = "cmd_new_thread",

  /**
   * @triggered by extension.
   * CMD_SYNC_PROJECT will trigger the project sync on the webview.
   */
  CMD_SYNC_PROJECT = "cmd_sync_project",

  // ---------------- HELPERS ----------------

  /**
   * @triggered by extension.
   * SHOW_SOFT_PAYWALL_MODAL will show the soft paywall modal on the webview.
   */
  SHOW_SOFT_PAYWALL_MODAL = "show_soft_paywall_modal",
}

export const EventRequestToResponseTypeMap: { [key: string]: EventResponseType } = {
  [EventRequestType.INITIALIZED]: EventResponseType.INITIALIZED,
  [EventRequestType.CREATE_AUTH_LINK]: EventResponseType.CREATE_AUTH_LINK,
  [EventRequestType.FIGMA_OAUTH_CONNECT]: EventResponseType.FIGMA_OAUTH_CONNECT,
  [EventRequestType.FIGMA_OAUTH_DISCONNECT]: EventResponseType.FIGMA_OAUTH_DISCONNECT,
  [EventRequestType.FIGMA_FILE_SELECTED]: EventResponseType.FIGMA_FILE_SELECTED,
  [EventRequestType.NEW_THREAD]: EventResponseType.NEW_THREAD,
  [EventRequestType.FETCH_THREADS]: EventResponseType.FETCH_THREADS,
  [EventRequestType.FETCH_THREAD]: EventResponseType.FETCH_THREAD,
  [EventRequestType.SEND_MESSAGE]: EventResponseType.SEND_MESSAGE,
  [EventRequestType.FAST_APPLY]: EventResponseType.FAST_APPLY,
  [EventRequestType.OPEN_FILE]: EventResponseType.SET_CURRENT_OPEN_FILE,
  [EventRequestType.FETCH_FILES]: EventResponseType.FETCH_FILES,
  [EventRequestType.FETCH_FILE_CONTENT]: EventResponseType.FETCH_FILE_CONTENT,
  [EventRequestType.FETCH_CURRENT_OPEN_FILE]: EventResponseType.FETCH_CURRENT_OPEN_FILE,
  [EventRequestType.PASTE_COPIED_CODE]: EventResponseType.PASTE_COPIED_CODE,
  [EventRequestType.GET_USER_INFO]: EventResponseType.GET_USER_INFO,
  [EventRequestType.GET_USER_SUBSCRIPTION]: EventResponseType.GET_USER_SUBSCRIPTION,
};

export interface EventRequestPayload {
  [EventRequestType.READY]: void;
  [EventRequestType.INITIALIZED]: void;
  [EventRequestType.LOGIN]: void;
  [EventRequestType.CREATE_ACCOUNT]: void;
  [EventRequestType.CREATE_AUTH_LINK]: CreateAuthLinkPayload;
  [EventRequestType.SYNC_PROJECT]: void;
  [EventRequestType.FIGMA_OAUTH_CONNECT]: void;
  [EventRequestType.FIGMA_OAUTH_DISCONNECT]: void;
  [EventRequestType.FIGMA_FILE_SELECTED]: FigmaFile;
  [EventRequestType.NEW_THREAD]: void;
  [EventRequestType.FETCH_THREADS]: void;
  [EventRequestType.FETCH_THREAD]: { threadID: string };
  [EventRequestType.STOP_MESSAGE]: void;
  [EventRequestType.SEND_MESSAGE]: SendMessagesRequestPayload;
  [EventRequestType.UPDATE_MESSAGE]: Message | null;
  [EventRequestType.FAST_APPLY]: FastApplyPayload;
  [EventRequestType.FAST_APPLY_ACCEPT]: { filePath: string };
  [EventRequestType.FAST_APPLY_REJECT]: { filePath: string };
  [EventRequestType.OPEN_FILE]: { filePath: string };
  [EventRequestType.FETCH_FILES]: void;
  [EventRequestType.FETCH_FILE_CONTENT]: FilePayload;
  [EventRequestType.FETCH_CURRENT_OPEN_FILE]: void;
  [EventRequestType.PASTE_COPIED_CODE]: { text: string };
  [EventRequestType.GET_USER_INFO]: void;
  [EventRequestType.GET_USER_SUBSCRIPTION]: void;
  [EventRequestType.SEND_NOTIFICATION]: SendNotificationPayload;
  [EventRequestType.OPEN_EXTERNAL_URL]: { url: string };
}

export interface EventResponsePayload {
  [EventResponseType.CONFIG]: ConfigPayload;
  [EventResponseType.INITIALIZED]: InitChatState;
  [EventResponseType.CREATE_AUTH_LINK]: AuthLinkPayload;
  [EventResponseType.SYNC_PROJECT_PROGRESS]: SyncProjectProgressPayload;
  [EventResponseType.FIGMA_OAUTH_CONNECT]: boolean;
  [EventResponseType.FIGMA_OAUTH_DISCONNECT]: void;
  [EventResponseType.FIGMA_FILE_SELECTED]: FigmaFile;
  [EventResponseType.NEW_THREAD]: Thread;
  [EventResponseType.FETCH_THREADS]: Thread[];
  [EventResponseType.FETCH_THREAD]: Thread;
  [EventResponseType.SEND_MESSAGE]: Message | null;
  [EventResponseType.MESSAGE_TEXT_DELTA]: TextDelta;
  [EventResponseType.FAST_APPLY]: boolean;
  [EventResponseType.FETCH_FILES]: FilePayload[];
  [EventResponseType.FETCH_FILE_CONTENT]: string;
  [EventResponseType.FETCH_CURRENT_OPEN_FILE]: FilePayload | null;
  [EventResponseType.SET_CURRENT_OPEN_FILE]: FilePayload | null;
  [EventResponseType.ADD_SELECTED_CODE]: FilePayload;
  [EventResponseType.PASTE_COPIED_CODE]: FilePayload | null;
  [EventResponseType.FOCUS_CHAT_INPUT]: void;
  [EventResponseType.CMD_NEW_THREAD]: void;
  [EventResponseType.CMD_SYNC_PROJECT]: void;
  [EventResponseType.SHOW_LOGIN_VIEW]: void;
  [EventResponseType.SHOW_CHAT_VIEW]: void;
  [EventResponseType.GET_USER_INFO]: User;
  [EventResponseType.GET_USER_SUBSCRIPTION]: UserSubscription;
  [EventResponseType.SHOW_SOFT_PAYWALL_MODAL]: void;
}

export type EventCallback<T extends EventResponseType> = (payload: EventResponsePayload[T]) => void;

export interface EventRequestMessage<T extends EventRequestType> {
  id: string;
  command: T;
  payload?: EventRequestPayload[T];
}

export interface EventResponseMessage<T extends EventResponseType> {
  id: string;
  command: T;
  payload?: EventResponsePayload[T];
  error?: Error;
}

export function newEventRequest<T extends EventRequestType>(
  command: T,
  payload?: EventRequestPayload[T]
): EventRequestMessage<T> {
  return { id: uuidv4(), command, payload };
}

export function newEventResponse<T extends EventResponseType>(
  command: T,
  payload?: EventResponsePayload[T]
): EventResponseMessage<T> {
  return { id: uuidv4(), command, payload };
}
