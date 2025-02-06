import type { Message } from '../../shared/model'

import { Api } from './api'
import { parseError } from './error'
import type { GetThreadArgs } from './thread'
import { buildMessageFromResponse } from './transformers'

export type GetMessageArgs = GetThreadArgs & {
  messageID: string
}

export type UpdateMessageArgs = GetMessageArgs & {
  feedback?: string
}

async function updateMessage({
  owner,
  repo,
  threadID,
  messageID,
  feedback
}: UpdateMessageArgs): Promise<Message> {
  try {
    const { data } = await Api.patch(
      `/repos/${owner}/${repo}/threads/${threadID}/messages/${messageID}`,
      {
        feedback: feedback ?? null
      }
    )
    return Promise.resolve(buildMessageFromResponse(data))
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

export { updateMessage }
