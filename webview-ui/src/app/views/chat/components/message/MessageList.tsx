import { useMemo } from 'react'

import { Role } from '../../../../../../../shared/model'
import { useMessages } from '../../../../layers/authenticated/providers/MessagesProvider'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { Messages } from './Messages'
import { StreamingMessage } from './StreamingMessage'
import { MessageListContainer } from './MessageListContainer'

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

  const isLastMessageAssistant =
    messagesToRender.length > 1 &&
    messagesToRender[messagesToRender.length - 1].role === Role.Assistant

  return (
    <>
      <Messages messages={messagesToRender} />
      <StreamingMessage isFollowUp={isLastMessageAssistant} />
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
