import { memo } from 'react'
import { type Message, Role } from '../../../../../../../../shared/model'
import { MessageContainer } from '../shared/MessageContainer'
import { MessageHeader } from '../shared/MessageHeader'
import { FeedbackDialog } from './FeedbackDialog'
import { MarkdownRender } from './markdown/MarkdownRender'

const AssistantMessageComponent = ({
  message,
  hasFeedback = false
}: {
  message: Message
  hasFeedback?: boolean
}) => {
  return (
    <MessageContainer role={Role.Assistant}>
      <MessageHeader role={Role.Assistant} />
      <MarkdownRender role={Role.Assistant}>
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

export const AssistantMessage = memo(AssistantMessageComponent)
