import type { Thread } from '../model'

export type ConfigPayload = {
  uriScheme: string
  allowAnonymousTelemetry: boolean
}

export type CreateAuthLinkPayload = {
  action: 'login' | 'create_account'
}

export type AuthLinkPayload = {
  uniqueLink: string
}

export type InitChatState = {
  isInitialized: boolean
  isFigmaAuthenticated: boolean
}

export type SyncProjectProgressPayload = {
  progress: number
  isFirstTimeSync?: boolean
}

export type FilePayload = {
  id: string
  name: string
  path?: string // Optional: There will be no absolute path when the file is returned from the server
  relativePath: string
  content?: string
  startLine?: number
  endLine?: number
  isCurrentOpenFile?: boolean
}

export type ThreadRunRequestFile = {
  path: string
  content?: string
  startLine?: number
  endLine?: number
  isCurrentOpenFile?: boolean
}

export type SendNotificationPayload = {
  message: string
}

export type FastApplyPayload = {
  filePath: string
  edits: string
}

export type FetchThreadsPayload = {
  cursor?: string
  take?: number
}

export type FetchThreadsResponse = {
  threads: Thread[]
  nextCursor: string | null
  previousCursor?: string
}
