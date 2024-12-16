import { MessageContent } from "../model";

export type ConfigPayload = {
  allowAnonymousTelemetry: boolean;
};

export type CreateAuthLinkPayload = {
  action: "login" | "create_account";
};

export type AuthLinkPayload = {
  uniqueLink: string;
};

export type InitChatState = {
  isInitialized: boolean;
  isFigmaAuthenticated: boolean;
};

export type SyncProjectProgressPayload = {
  progress: number;
  isFirstTimeSync?: boolean;
};

export type FilePayload = {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  isCurrentOpenFile?: boolean;
  startLine?: number;
  endLine?: number;
  content?: string;
};

export type SendMessagesRequestPayload = {
  files: FilePayload[];
  messages: MessageContent[];
};

export type FigmaFile = {
  selectionLink: string;
  imageUrl: string;
  isLoading: boolean;
};

export type SendNotificationPayload = {
  message: string;
};

export type FastApplyPayload = {
  filePath: string;
  edits: string;
};
