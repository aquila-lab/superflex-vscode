import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { AssistantMessage } from './assistant/AssistantMessage'

export const StreamingMessage = () => {
  const { message } = useNewMessage()

  if (!message?.content.text) {
    return null
  }

  return (
    <AssistantMessage
      message={message}
      isStreamingMessage
    />
  )
}
