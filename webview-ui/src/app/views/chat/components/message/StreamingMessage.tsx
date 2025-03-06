import { memo, useMemo } from 'react'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { AssistantMessage } from './assistant/AssistantMessage'

const StreamingMessageComponent = () => {
  const { message, isMessageStreaming } = useNewMessage()

  const shouldRender = useMemo(
    () => isMessageStreaming && message?.content.text,
    [isMessageStreaming, message?.content.text]
  )

  if (!shouldRender || !message) {
    return null
  }

  return <AssistantMessage message={message} />
}

export const StreamingMessage = memo(StreamingMessageComponent)
