import { Role } from '../../../../../../../../shared/model'
import { MessageContainer } from '../shared/MessageContainer'
import { MessageHeader } from '../shared/MessageHeader'

export const UserMessageHeader = ({
  picture,
  username,
  isDraft
}: {
  picture?: string | null
  username: string
  isDraft: boolean
}) => (
  <MessageContainer role={Role.User}>
    <MessageHeader
      role={Role.User}
      picture={picture}
      username={username}
      isDraft={isDraft}
    />
  </MessageContainer>
)
