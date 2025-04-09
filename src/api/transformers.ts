import fs from 'node:fs'
import path from 'node:path'

import type {
  Message,
  MessageContent,
  Plan,
  Thread,
  User,
  UserSubscription
} from '../../shared/model'
import type { FilePayload } from '../../shared/protocol/types'
import { generateFileID } from '../common/utils'

export function buildUserFromResponse(res: any): User {
  return {
    id: res.id,
    email: res.email,
    username: res.username,
    picture: res.picture ?? null,
    stripeCustomerID: res.stripe_customer_id ?? null
  }
}

export function buildPlanFromResponse(res: any): Plan {
  return {
    name: res.name,
    basicRequestLimit: res.basic_request_limit,
    premiumRequestLimit: res.premium_request_limit,
    figmaRequestLimit: res.figma_request_limit
  }
}

export function buildUserSubscriptionFromResponse(res: any): UserSubscription {
  return {
    plan: res.plan ? buildPlanFromResponse(res.plan) : null,
    basicRequestsUsed: res.basic_requests_used,
    premiumRequestsUsed: res.premium_requests_used,
    figmaRequestsUsed: res.figma_requests_used || 0,
    lastResetDate: new Date(res.last_reset_date),
    createdAt: new Date(res.created_at),
    endDate: res.end_date ? new Date(res.end_date) : null
  }
}

function buildMessageContentFromResponse(res: any): MessageContent {
  const content: MessageContent = {
    text: res.text,
    enhancedText: res.enhanced_text,
    files: res.files.map(
      (file: any) =>
        ({
          id: generateFileID(file.path, file.start_line, file.end_line),
          name: path.basename(file.path),
          relativePath: file.path,
          startLine: file.start_line,
          endLine: file.end_line
        }) as FilePayload
    )
  }

  if (res.attachment) {
    if (res.attachment.image) {
      content.attachment = {
        image: res.attachment.image
      }
    } else if (res.attachment.figma) {
      content.attachment = {
        figma: {
          fileID: res.attachment.figma.file_id,
          nodeID: res.attachment.figma.node_id,
          imageUrl: res.attachment.figma.image_url
        }
      }
    }
  }

  return content
}

export function buildMessageFromResponse(res: any): Message {
  return {
    id: res.id,
    threadID: res.thread_id,
    role: res.role,
    content: buildMessageContentFromResponse(res.content),
    feedback: res.feedback ?? undefined,
    updatedAt: new Date(res.updated_at),
    createdAt: new Date(res.created_at)
  }
}

export function buildThreadFromResponse(res: any): Thread {
  return {
    id: res.id,
    title: res.title,
    updatedAt: new Date(res.updated_at),
    createdAt: new Date(res.created_at),

    messages: (res.messages ?? []).map((msg: any) =>
      buildMessageFromResponse(msg)
    )
  }
}

export function buildThreadRunRequest(
  message: MessageContent
): Record<string, any> {
  const reqBody: Record<string, any> = {
    original_text: message.enhancedText ? message.text : undefined,
    text: message.enhancedText ?? message.text,
    files: []
  }

  if (message.files) {
    reqBody.files = _buildFiles(message.files)
  }

  if (message.attachment) {
    if (message.attachment.image) {
      reqBody.attachment = {
        image: message.attachment.image
      }
    } else if (message.attachment.figma) {
      reqBody.attachment = {
        figma: {
          file_id: message.attachment.figma.fileID,
          node_id: message.attachment.figma.nodeID
        }
      }
    }
  }

  if (message.fromMessageID) {
    reqBody.from_message_id = message.fromMessageID
  }

  return reqBody
}

export function buildPromptEnhancementRequest(
  threadID: string,
  message: MessageContent
): Record<string, any> {
  const reqBody: Record<string, any> = {
    text: message.text,
    image: message.attachment?.image ?? message.attachment?.figma?.imageUrl,
    files: []
  }

  if (message.files) {
    reqBody.files = _buildFiles(message.files)
  }

  if (threadID) {
    reqBody.thread_id = threadID
  }

  if (message.fromMessageID) {
    reqBody.from_message_id = message.fromMessageID
  }

  return reqBody
}

type ThreadRunRequestFile = {
  path: string
  content?: string
  start_line?: number
  end_line?: number
  is_current_open_file?: boolean
}

function _buildFiles(files: FilePayload[]): ThreadRunRequestFile[] {
  const _files: ThreadRunRequestFile[] = []
  for (const file of files ?? []) {
    if (!file.path) {
      continue
    }

    if (!fs.existsSync(file.path)) {
      continue
    }

    if (file.startLine === undefined && file.endLine === undefined) {
      file.content = fs.readFileSync(file.path, 'utf8')
    }

    const requestFile: ThreadRunRequestFile = {
      path: file.relativePath,
      content: file.content,
      start_line: file.startLine,
      end_line: file.endLine,
      is_current_open_file: file.isCurrentOpenFile
    }

    _files.push(requestFile)
  }

  return _files
}
