import { useMemo } from 'react'
import { useMessages } from '../../../../layers/authenticated/providers/MessagesProvider'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { MessageListContainer } from './MessageListContainer'
import { Messages } from './Messages'
import { StreamingMessage } from './StreamingMessage'

const MessageRenderer = () => {
  const { messages } = useMessages()
  const { message: streamingMessage } = useNewMessage()

  const messagesToRender = useMemo(() => {
    if (!streamingMessage || messages.length === 0) {
      return messages
    }

    const lastMessage = messages[messages.length - 1]
    if (
      lastMessage &&
      lastMessage.threadID === streamingMessage.threadID &&
      streamingMessage.id === lastMessage.id
    ) {
      return messages.slice(0, -1)
    }

    return messages
  }, [messages, streamingMessage])

  return (
    <>
      <Messages messages={messagesToRender} />
      <StreamingMessage />
    </>
  )
}

export const MessageList = () => {
  return (
    <MessageListContainer>
      <MessageRenderer />
    </MessageListContainer>
  )
}
