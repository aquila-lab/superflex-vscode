export enum Role {
  User = "user",
  Assistant = "assistant",
}

export interface FigmaAttachment {
  fileID: string;
  nodeID: string;
  imageUrl?: string;
}

export interface MessageAttachment {
  image?: string;
  figma?: FigmaAttachment;
}

export interface AttachedFile {
  path: string;
  content: string;
  startLine?: number;
  endLine?: number;
  isCurrentOpenFile?: boolean;
}

export interface MessageContent {
  /**
   * Optional ID reference to a previous message. Used when regenerating/editing
   * responses to maintain conversation context.
   */
  fromMessageID?: string;

  /**
   * The main text of the message. This contains the actual message text
   * that will be displayed to the user.
   */
  text: string;

  /**
   * Optional attachment for the message. Can include either an Image or Figma.
   * See MessageAttachment interface for details.
   */
  attachment?: MessageAttachment;

  /**
   * Array of files that user has attached to this message. These files are used
   * to give the AI additional context about the codebase when processing the message.
   */
  files: AttachedFile[];
}

export interface TextDelta {
  textDelta: string;
}

export interface Message {
  /** @type {Generics.UUID} */
  id: string;
  /** @type {Generics.UUID} */
  threadID: string;

  role: Role;
  content: MessageContent;

  feedback?: string;

  updatedAt: Date;
  createdAt: Date;
}
