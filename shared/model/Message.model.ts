import type { FilePayload } from '../protocol/types'
import type { AppWarning } from './AppWarning.model'

export enum Role {
  User = 'user',
  Assistant = 'assistant'
}

export interface FigmaAttachment {
  fileID: string
  nodeID: string
  imageUrl: string
  warning?: AppWarning
}

export interface MessageAttachment {
  image?: string
  figma?: FigmaAttachment
}

export type MessageContent = {
  /**
   * Optional ID reference to a previous message. Used when regenerating/editing
   * responses to maintain conversation context.
   */
  fromMessageID?: string

  /**
   * Optional message that user has sent with or without the attachment.
   * Used as an input for the prompt enhancer.
   */
  originalText?: string

  /**
   * Optional if there are attachments.
   * This contains the actual message text that will be displayed to the user.
   */
  text?: string

  /**
   * Optional attachment for the message. Can include either an Image or Figma.
   * See MessageAttachment interface for details.
   */
  attachment?: MessageAttachment

  /**
   * Optional array of files that user has attached to this message. These files are used
   * to give the AI additional context about the codebase when processing the message.
   */
  files?: FilePayload[]
} & ({ text: string } | { attachment: MessageAttachment })

export interface MessageStream {
  /**
   * The type of the message stream can be either "delta" or "complete".
   */
  type: 'delta' | 'complete'

  /**
   * If the type is "delta", this field contains the text delta of the message stream.
   */
  textDelta?: string

  /**
   * If the type is "complete", this field contains the complete message of the message stream.
   */
  message?: Message
}

export interface Message {
  /** @type {Generics.UUID} */
  id: string
  /** @type {Generics.UUID} */
  threadID: string

  role: Role
  content: MessageContent

  feedback?: string

  updatedAt: Date
  createdAt: Date
}
