export enum Role {
  User = "user",
  Assistant = "assistant",
}

export enum MessageType {
  Text = "text",
  Image = "image",
  Figma = "figma",
}

export type TextDelta = {
  value: string;
};

export type MessageReqest = {
  type: MessageType;
  content: string;
};

export type Message = {
  /** @type {Generics.UUID} */
  id: string;
  /** @type {Generics.UUID} */
  threadID: string;

  role: Role;
  type: MessageType;
  content: string;

  feedback?: string;

  updatedAt: Date;
  createdAt: Date;
};
