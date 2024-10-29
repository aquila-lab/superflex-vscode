import { MessageReqest } from "../model";

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
  name: string;
  path: string;
  relativePath: string;
  isCurrentOpenFile?: boolean;
};

export type SendMessagesRequestPayload = {
  files: FilePayload[];
  messages: MessageReqest[];
};

export type FigmaFile = {
  selectionLink: string;
  imageUrl: string;
  isLoading: boolean;
};

export type SendNotificationPayload = {
  message: string;
};
