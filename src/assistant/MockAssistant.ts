import { Thread } from "../core/Thread.model";
import { Message, MessageReqest, MessageType, Role, TextDelta } from "../core/Message.model";
import { Assistant } from "./Assistant";

export default class MockAssistant implements Assistant {
  async createThread(title?: string): Promise<Thread> {
    return {
      id: "00000000-0000-0000-0000-000000000000",
      title: "thread-mock",
      messages: [],
      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  async sendMessage(
    threadID: string,
    messages: MessageReqest[],
    streamResponse?: (event: TextDelta) => void
  ): Promise<Message> {
    return {
      id: "00000000-0000-0000-0000-000000000000",
      threadID: threadID,
      role: Role.Assistant,
      type: MessageType.Text,
      content: "",
      updatedAt: new Date(),
      createdAt: new Date(),
    };
  }

  async syncFiles(progressCb?: (current: number) => void): Promise<void> {
    return;
  }
}
