import { Message, MessageContent, Thread, ThreadRun } from "../../shared/model";
import { Logger } from "../common/logger";
import { Api } from "./api";
import { RepoArgs } from "./repo";
import { parseError } from "./error";
import { buildMessageFromResponse, buildThreadFromResponse, buildThreadRunRequest } from "./transformers";

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
  message: MessageContent;
  options: {
    signal: AbortSignal;
  };
};

async function sendThreadMessage({
  owner,
  repo,
  threadID,
  message,
  options,
}: SendThreadMessageArgs): Promise<ThreadRun> {
  try {
    const reqBody = buildThreadRunRequest(message);
    const response = await Api.post(`/repos/${owner}/${repo}/threads/${threadID}/runs`, reqBody, {
      headers: { "x-is-stream": "true" },
      responseType: "stream",
      signal: options.signal,
    });

    let buffer = "";
    let streamError: Error | null = null;
    let messages: Message[] = [];

    return {
      stream: (async function* () {
        for await (const chunk of response.data) {
          try {
            let chunkStr = chunk.toString();
            if (!chunkStr.endsWith("}")) {
              buffer += chunkStr;
              continue;
            }
            if (!chunkStr.startsWith("{")) {
              chunkStr = buffer + chunkStr;
              buffer = "";
            }

            const data = JSON.parse(chunkStr);
            if (data.is_complete) {
              const message = buildMessageFromResponse(data.message);
              messages.push(message);
              yield { type: "complete", message };
              continue;
            }

            yield { type: "delta", textDelta: data.text_delta };
          } catch (err) {
            Logger.warn("failed to parse chunk:", err);
            streamError = err as Error;
            throw streamError;
          }
        }
      })(),

      async response(): Promise<{ messages: Message[]; isPremium: boolean }> {
        // Wait for all chunks to be processed
        for await (const _ of this.stream) {
          // Consume the iterator
        }

        if (streamError) {
          throw streamError;
        }

        return { messages, isPremium: response.headers["x-is-premium-request"] === "true" };
      },
    };
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { createThread, getThreads, getThread, deleteThread, sendThreadMessage };
