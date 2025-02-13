import type { MessageContent } from '../../../../../../shared/model'
import { useUser } from '../../../layer/authenticated/UserProvider'
import { ChatAttachment } from './ChatAttachment'
import { useEditMode } from './EditModeProvider'
import { FigmaSelectionModal } from './FigmaSelectionModal'
import { InputProvider } from './InputProvider'
import { InputSection } from './InputSection'
import { UserMessageHeader } from './UserMessageHeader'

export const ChatInputBox = ({
  content,
  messageId
}: {
  content?: MessageContent
  messageId?: string
}) => {
  const { isMainTextbox, isDraft } = useEditMode()
  const { user } = useUser()

  if (isMainTextbox) {
    return (
      <>
        <ChatAttachment />
        <InputProvider text={content?.text}>
          <InputSection content={content} />
          <FigmaSelectionModal />
        </InputProvider>
      </>
    )
  }

  return (
    <InputProvider
      text={content?.text}
      id={messageId}
    >
      <UserMessageHeader
        picture={user.picture}
        username={user.username}
        isDraft={isDraft}
      />
      <InputSection content={content} />
      <FigmaSelectionModal />
    </InputProvider>
  )
}
