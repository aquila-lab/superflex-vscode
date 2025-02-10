import { type Message, Role } from '../../../../shared/model'
import { ChatMessageContainer } from './ChatMessageContainer'
import { ChatMessageHeader } from './ChatMessageHeader'
import { FeedbackDialog } from './FeedbackDialog'
import { MarkdownRender } from './MarkdownRender'

export const AssistantMessage = ({
  message,
  hasFeedback = false,
  isStreamingMessage = false
}: {
  message: Message
  hasFeedback?: boolean
  isStreamingMessage?: boolean
}) => {
  return (
    <ChatMessageContainer role={Role.Assistant}>
      <ChatMessageHeader role={Role.Assistant} />
      <MarkdownRender
        role={Role.Assistant}
        isStreamingMessage={isStreamingMessage}
      >
        {message.content.text}
      </MarkdownRender>
      {hasFeedback && !message.feedback && (
        <div className='mt-4'>
          <FeedbackDialog message={message} />
        </div>
      )}
    </ChatMessageContainer>
  )
}
