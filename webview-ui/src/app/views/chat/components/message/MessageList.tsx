import { MessageListContainer } from './MessageListContainer'
import { Messages } from './Messages'
import { StreamingMessage } from './StreamingMessage'

export const MessageList = () => {
  return (
    <MessageListContainer>
      <Messages />
      <StreamingMessage />
    </MessageListContainer>
  )
}
