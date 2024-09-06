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

  updatedAt: Date;
  createdAt: Date;
};

export function buildMessageFromResponse(res: any): Message {
  return {
    id: res.id,
    threadID: res.thread_id,
    role: res.role,
    type: res.type,
    content: res.content,
    updatedAt: new Date(res.updated_at),
    createdAt: new Date(res.created_at),
  };
}
