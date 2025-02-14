import { type Message, Role } from '../../../../../../../../shared/model'
import { MarkdownRender } from './markdown/MarkdownRender'
import { FeedbackDialog } from './FeedbackDialog'
import { MessageContainer } from '../shared/MessageContainer'
import { MessageHeader } from '../shared/MessageHeader'

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
    <MessageContainer role={Role.Assistant}>
      <MessageHeader role={Role.Assistant} />
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
    </MessageContainer>
  )
}
