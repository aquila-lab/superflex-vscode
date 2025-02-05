import { Message, MessageContent, Thread, ThreadRun } from "../../shared/model";
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

    let messages: Message[] = [];
    let streamError: Error | null = null;

    const streamGenerator = (async function* () {
      let buffer = "";

      for await (const chunk of response.data) {
        try {
          // Convert chunk to string and append to existing buffer
          buffer += chunk.toString();

          // Process buffer as long as we can find complete JSON objects
          while (true) {
            // Find the first complete JSON object
            const openBraceIndex = buffer.indexOf("{");
            if (openBraceIndex === -1) {
              break; // No JSON object starts, keep buffer
            }

            // Find matching closing brace by counting braces
            let braceCount = 0;
            let closeBraceIndex = -1;
            let inString = false;
            let escapeNext = false;

            for (let i = openBraceIndex; i < buffer.length; i++) {
              const char = buffer[i];

              if (escapeNext) {
                escapeNext = false;
                continue;
              }

              if (char === "\\") {
                escapeNext = true;
                continue;
              }

              if (char === '"') {
                inString = !inString;
                continue;
              }

              if (!inString) {
                if (char === "{") braceCount++;
                if (char === "}") braceCount--;
                if (braceCount === 0) {
                  closeBraceIndex = i;
                  break;
                }
              }
            }

            if (closeBraceIndex === -1) {
              break; // No complete JSON object yet, keep buffer
            }

            // Extract the potential JSON string
            const jsonStr = buffer.slice(openBraceIndex, closeBraceIndex + 1);

            try {
              const data = JSON.parse(jsonStr);

              // Handle complete message with nested structure
              if (data.is_complete && data.message) {
                const message = buildMessageFromResponse(data.message);
                messages.push(message);
                yield { type: "complete" as const, message };
              }
              // Handle delta update
              else if (data.text_delta !== undefined) {
                yield { type: "delta" as const, textDelta: data.text_delta };
              }

              // Remove processed JSON from buffer
              buffer = buffer.slice(closeBraceIndex + 1);
            } catch (parseError) {
              // If parsing fails, it might be incomplete. Keep in buffer.
              break;
            }
          }
        } catch (err) {
          streamError = err as Error;
          throw streamError;
        }
      }

      // Handle any remaining buffer data at end of stream
      if (buffer.length > 0) {
        try {
          const data = JSON.parse(buffer);
          if (data.is_complete && data.message) {
            const message = buildMessageFromResponse(data.message);
            messages.push(message);
            yield { type: "complete" as const, message };
          }
        } catch (err) {
          // Ignore parsing errors for final buffer
        }
      }
    })();

    return {
      stream: streamGenerator,

      async response(): Promise<{ messages: Message[]; isPremium: boolean }> {
        // Wait for all chunks to be processed by consuming the stream
        for await (const _ of streamGenerator) {
          // Consume the iterator
        }

        if (streamError) {
          throw streamError;
        }

        return {
          messages,
          isPremium: response.headers["x-is-premium-request"] === "true",
        };
      },
    };
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { createThread, getThreads, getThread, deleteThread, sendThreadMessage };
