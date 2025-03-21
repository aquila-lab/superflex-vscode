import type { MessageContent } from '../../shared/model'
import { Api } from './api'
import { parseError } from './error'
import { buildPromptEnhancementRequest } from './transformers';

async function enhancePrompt(
  messageContent: MessageContent
): Promise<MessageContent> {
  try {
    const reqBody = buildPromptEnhancementRequest(messageContent);
    const { data } = await Api.post('/prompt/enhance', reqBody)

    return Promise.resolve({
      ...messageContent,
      originalText: messageContent.text,
      text: data.text
    })
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

export { enhancePrompt }
