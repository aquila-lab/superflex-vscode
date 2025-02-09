import { useNewMessage } from '../../context/NewMessageContext'
import { AssistantMessage } from './AssistantMessage'

export const StreamingMessage = () => {
  const { message } = useNewMessage()

  if (!message?.content.text) {
    return null
  }

  return <AssistantMessage message={message} />
}
