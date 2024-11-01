import fs from "fs";

import { FilePayload } from "../../shared/protocol";
import { MessageContent, MessageType, Thread, ThreadRun } from "../../shared/model";

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
  messages: MessageContent[];
};

async function sendThreadMessage({
  owner,
  repo,
  threadID,
  files,
  messages,
}: SendThreadMessageArgs): Promise<ThreadRun> {
  try {
    const response = await Api.post(`/repos/${owner}/${repo}/threads/${threadID}/runs`, {
      files: files.map((file) => ({
        path: file.relativePath,
        content: fs.readFileSync(file.path).toString(),
      })),
      messages: messages.map((msg) => {
        if (msg.type === MessageType.Figma) {
          return {
            type: msg.type,
            file_id: msg.fileID,
            node_id: msg.nodeID,
          };
        }
        return msg;
      }),
    });

    return Promise.resolve({
      message: buildMessageFromResponse(response.data),
      isPremium: response.headers["x-is-premium-request"] === "true",
    });
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { createThread, getThreads, getThread, deleteThread, sendThreadMessage };
