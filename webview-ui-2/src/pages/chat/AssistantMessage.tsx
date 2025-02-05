import { Role } from '../../../../shared/model'
import { ChatMessageContainer } from './ChatMessageContainer'
import { ChatMessageHeader } from './ChatMessageHeader'
import { MarkdownRender } from './MarkdownRender'

export const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <ChatMessageContainer role={Role.Assistant}>
      <ChatMessageHeader role={Role.Assistant} />
      <MarkdownRender role={Role.Assistant}>{text}</MarkdownRender>
    </ChatMessageContainer>
  )
}
