import fs from "fs";

import { FilePayload } from "../../shared/protocol";
import { MessageReqest, Message, Thread } from "../../shared/model";

import { Api } from "./api";
import { RepoArgs } from "./repo";
import { parseError } from "./error";
import { buildMessageFromResponse, buildThreadFromResponse } from "./transformers";

export type CreateThreadArgs = RepoArgs & {
  title?: string;
};

async function createThread({ owner, repo, title }: CreateThreadArgs): Promise<Thread> {
  try {
    const { data } = await Api.post(`/repos/${owner}/${repo}/threads`, { title });
    return Promise.resolve(buildThreadFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export type GetThreadsArgs = RepoArgs;

async function getThreads({ owner, repo }: GetThreadsArgs): Promise<Thread[]> {
  try {
    const { data } = await Api.get(`/repos/${owner}/${repo}/threads`);
    return Promise.resolve(data.threads.map(buildThreadFromResponse));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export type GetThreadArgs = RepoArgs & {
  threadID: string;
};

async function getThread({ owner, repo, threadID }: GetThreadArgs): Promise<Thread> {
  try {
    const { data } = await Api.get(`/repos/${owner}/${repo}/threads/${threadID}`);
    return Promise.resolve(buildThreadFromResponse(data));
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

export type SendThreadMessageArgs = GetThreadArgs & {
  files: FilePayload[];
  messages: MessageReqest[];
};

async function sendThreadMessage({ owner, repo, threadID, files, messages }: SendThreadMessageArgs): Promise<Message> {
  try {
    const { data } = await Api.post(`/repos/${owner}/${repo}/threads/${threadID}/runs`, {
      files: files.map((file) => ({
        path: file.relativePath,
        content: fs.readFileSync(file.path).toString(),
      })),
      messages: messages.map((msg) => ({
        type: msg.type,
        content: msg.content,
      })),
    });

    return Promise.resolve(buildMessageFromResponse(data));
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { createThread, getThreads, getThread, deleteThread, sendThreadMessage };
