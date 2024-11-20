import fs from "fs";

import { FilePayload } from "../../shared/protocol";
import { MessageContent, MessageType, TextDelta, Thread, ThreadRun } from "../../shared/model";
import { Logger } from "../common/logger";
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

interface ThreadRunStream {
  on(event: "textDelta", callback: (delta: TextDelta) => void): void;
  final(): Promise<ThreadRun>;
}

async function sendThreadMessage({
  owner,
  repo,
  threadID,
  files,
  messages,
}: SendThreadMessageArgs): Promise<ThreadRunStream> {
  try {
    const filesToSend = files.filter((file) => !file.endLine);

    const response = await Api.post(
      `/repos/${owner}/${repo}/threads/${threadID}/runs`,
      {
        files: filesToSend.map((file) => ({
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
      },
      {
        headers: { "x-is-stream": "true" },
        responseType: "stream",
      }
    );

    const listeners = new Set<(delta: TextDelta) => void>();

    const cleanup = () => {
      listeners.clear();
      response.data.removeAllListeners();
    };

    let buffer = "";
    response.data.on("data", (chunk: Buffer) => {
      try {
        let chunkStr = chunk.toString();
        if (!chunkStr.endsWith("}")) {
          buffer += chunkStr;
          return;
        }
        if (!chunkStr.startsWith("{")) {
          chunkStr = buffer + chunkStr;
          buffer = "";
        }

        const data = JSON.parse(chunkStr);
        if (data.is_complete) {
          response.data.emit("complete", {
            message: buildMessageFromResponse(data.message),
            isPremium: response.headers["x-is-premium-request"] === "true",
          });
          cleanup();
          return;
        }

        listeners.forEach((listener) => listener({ type: MessageType.TextDelta, value: data.text_delta }));
      } catch (err) {
        Logger.warn("failed to parse chunk:", err);
      }
    });

    response.data.on("error", (err: any) => {
      cleanup();
      Logger.error("stream error:", err);
    });

    return {
      on: (event: "textDelta", callback: (delta: TextDelta) => void) => {
        listeners.add(callback);
      },
      final: () => {
        return new Promise((resolve, reject) => {
          response.data.on("complete", (result: ThreadRun) => {
            cleanup();
            resolve(result);
          });
          response.data.on("error", (err: any) => {
            cleanup();
            reject(err);
          });
        });
      },
    };
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { createThread, getThreads, getThread, deleteThread, sendThreadMessage };
