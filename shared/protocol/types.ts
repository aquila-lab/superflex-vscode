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
  content?: string;
  startLine?: number;
  endLine?: number;
  isCurrentOpenFile?: boolean;
};

export type SendNotificationPayload = {
  message: string;
};

export type FastApplyPayload = {
  filePath: string;
  edits: string;
};
