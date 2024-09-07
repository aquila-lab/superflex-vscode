import { User, Message, Thread } from "../../shared/model";

export function buildUserFromResponse(res: any): User {
  return {
    id: res.id,
    email: res.email,
  };
}

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

export function buildThreadFromResponse(res: any): Thread {
  return {
    id: res.id,
    title: res.title,
    updatedAt: new Date(res.updated_at),
    createdAt: new Date(res.created_at),
    messages: (res.messages ?? []).map((msg: any) => buildMessageFromResponse(msg)),
  };
}
