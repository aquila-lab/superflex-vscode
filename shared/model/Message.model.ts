export enum Role {
  User = "user",
  Assistant = "assistant",
}

export enum MessageType {
  Text = "text",
  TextDelta = "text_delta",
  Image = "image",
  Figma = "figma",
}

export type TextDelta = {
  type: MessageType.TextDelta;
  value: string;
};

export interface TextContent {
  type: MessageType.Text;
  text: string;
}

export interface ImageContent {
  type: MessageType.Image;
  image: string;
}

export interface FigmaContent {
  type: MessageType.Figma;
  fileID: string;
  nodeID: string;
  image: string;
}

export type MessageContent = TextContent | TextDelta | ImageContent | FigmaContent;

export type Message = {
  /** @type {Generics.UUID} */
  id: string;
  /** @type {Generics.UUID} */
  threadID: string;

  role: Role;
  content: MessageContent;

  feedback?: string;

  updatedAt: Date;
  createdAt: Date;
};
