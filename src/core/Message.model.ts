export enum Role {
  User = "user",
  Assistant = "assistant",
}

export enum MessageType {
  Text = "text",
  Image = "image",
}

export interface MessageData {
  /** @type {Generics.UUID} */
  id: string;
  /** @type {Generics.UUID} */
  threadID: string;
  role: Role;
  type: MessageType;
  content: string;
  updatedAt: Date;
  createdAt: Date;
}

class Message implements MessageData {
  id: string;
  threadID: string;
  role: Role;
  type: MessageType;
  content: string;
  updatedAt: Date;
  createdAt: Date;

  constructor(data: MessageData) {
    this.id = data.id;
    this.threadID = data.threadID;
    this.role = data.role;
    this.type = data.type;
    this.content = data.content;
    this.updatedAt = data.updatedAt;
    this.createdAt = data.createdAt;
  }

  static buildMessageDataFromResponse(response: any): MessageData {
    return {
      id: response.id,
      threadID: response.thread_id,
      role: response.role,
      type: response.type,
      content: response.content,
      updatedAt: new Date(response.updated_at),
      createdAt: new Date(response.created_at),
    };
  }
}

export default Message;
