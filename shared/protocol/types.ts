import { MessageReqest } from "../model";

export type InitState = {
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
