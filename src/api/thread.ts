import { Api } from "./api";
import { RepoArgs } from "./repo";
import { parseError } from "./error";
import Thread, { ThreadData } from "../core/Thread.model";
import Message, { MessageData, MessageType } from "../core/Message.model";

export type CreateThreadArgs = RepoArgs & {
  title?: string;
};

async function createThread({ owner, repo, title }: CreateThreadArgs): Promise<ThreadData> {
  try {
    const { data } = await Api.post(`/repos/${owner}/${repo}/threads`, { title });
    return Promise.resolve(Thread.buildThreadDataFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export type GetThreadsArgs = RepoArgs;

async function getThreads({ owner, repo }: GetThreadsArgs): Promise<ThreadData[]> {
  try {
    const { data } = await Api.get(`/repos/${owner}/${repo}/threads`);
    return Promise.resolve(data.threads.map(Thread.buildThreadDataFromResponse));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export type GetThreadArgs = RepoArgs & {
  threadID: string;
};

async function getThread({ owner, repo, threadID }: GetThreadArgs): Promise<ThreadData> {
  try {
    const { data } = await Api.get(`/repos/${owner}/${repo}/threads/${threadID}`);
    return Promise.resolve(Thread.buildThreadDataFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

async function deleteThread({ owner, repo, threadID }: GetThreadArgs): Promise<void> {
  try {
    await Api.delete(`/repos/${owner}/${repo}/threads/${threadID}`);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export type ThreadRunArgs = GetThreadArgs & {
  messages: {
    type: MessageType;
    content: string;
  }[];
};

async function threadRun({ owner, repo, threadID, messages }: ThreadRunArgs): Promise<MessageData> {
  try {
    const { data } = await Api.post(`/repos/${owner}/${repo}/threads/${threadID}/runs`, {
      messages: messages.map((msg) => ({
        type: msg.type,
        content: msg.content,
      })),
    });

    return Promise.resolve(Message.buildMessageDataFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { createThread, getThreads, getThread, deleteThread, threadRun };
