import { Role } from '../../../../../../../shared/model'
import { ChatMessageContainer } from './ChatMessageContainer'
import { ChatMessageHeader } from './ChatMessageHeader'

export const UserMessageHeader = ({
  picture,
  username,
  isDraft
}: {
  picture?: string | null
  username: string
  isDraft: boolean
}) => (
  <ChatMessageContainer role={Role.User}>
    <ChatMessageHeader
      role={Role.User}
      picture={picture}
      username={username}
      isDraft={isDraft}
    />
  </ChatMessageContainer>
)
