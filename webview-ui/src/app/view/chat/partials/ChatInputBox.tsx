import { ChatAttachment } from './ChatAttachment'
import { InputSection } from './InputSection'
import { UserMessageHeader } from './UserMessageHeader'
import { FigmaSelectionModal } from './FigmaSelectionModal'
import type { MessageContent } from '../../../../../../shared/model'
import { useUser } from '../../../layer/authenticated/UserProvider'
import { useEditMode } from './EditModeProvider'
import { InputProvider } from './InputProvider'

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
    <InputProvider text={content?.text} id={messageId}>
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
