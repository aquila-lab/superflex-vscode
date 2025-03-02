import { MessageContent } from 'shared/model';
import { Api } from './api'
import { parseError } from './error'

async function enhancePrompt(messageContent: MessageContent): Promise<MessageContent> {
  try {
    if (!messageContent.attachment) {
      return messageContent;
    }

    let image;
    if (messageContent.attachment.image) {
      image = messageContent.attachment.image;
    }
    else if (messageContent.attachment.figma) {
      if (!messageContent.attachment.figma.imageUrl) {
        console.warn("No image URL for Figma attachment")
        return messageContent;
      }
      image = messageContent.attachment.figma.imageUrl;
    }
    else {
      console.warn("Unsupported attachment type")
      return messageContent;
    }

    const text = messageContent.text ?? "";

    const { data } = await Api.post('/prompt/enhance', { text, image });

    return Promise.resolve({
      ...messageContent,
      originalText: messageContent.text,
      text: data.text
    });
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

export { enhancePrompt }