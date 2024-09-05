import Message, { MessageData } from "./Message.model";

export interface ThreadData {
  /** @type {Generics.UUID} */
  id: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;

  messages: MessageData[];
}

class Thread implements ThreadData {
  id: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;

  messages: MessageData[] = [];

  constructor(data: ThreadData) {
    this.id = data.id;
    this.title = data.title;
    this.updatedAt = data.updatedAt;
    this.createdAt = data.createdAt;
    this.messages = data.messages ?? [];
  }

  static buildThreadDataFromResponse(response: any): ThreadData {
    const messages: MessageData[] = (response.messages ?? []).map((msg: any) =>
      Message.buildMessageDataFromResponse(msg)
    );

    return {
      id: response.id,
      title: response.title,
      updatedAt: new Date(response.updated_at),
      createdAt: new Date(response.created_at),
      messages,
    };
  }
}

export default Thread;
