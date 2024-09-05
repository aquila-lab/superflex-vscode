import { buildMessageFromResponse, Message } from "./Message.model";

export type Thread = {
  /** @type {Generics.UUID} */
  id: string;

  title: string;
  messages: Message[];

  updatedAt: Date;
  createdAt: Date;
};

export function buildThreadFromResponse(res: any): Thread {
  return {
    id: res.id,
    title: res.title,
    updatedAt: new Date(res.updated_at),
    createdAt: new Date(res.created_at),
    messages: (res.messages ?? []).map((msg: any) => buildMessageFromResponse(msg)),
  };
}
