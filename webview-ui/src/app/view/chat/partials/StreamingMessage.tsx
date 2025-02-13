import { useNewMessage } from '../../../layer/authenticated/NewMessageProvider'
import { AssistantMessage } from './AssistantMessage'

export const StreamingMessage = () => {
  const { message } = useNewMessage()

  if (!message?.content.text) {
    return null
  }

  return <AssistantMessage message={message} isStreamingMessage />
}
