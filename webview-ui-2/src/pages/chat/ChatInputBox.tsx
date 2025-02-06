import type { MessageContent } from '../../../../shared/model'
import { AttachmentProvider } from '../../context/AttachmentContext'
import { useEditMode } from '../../context/EditModeContext'
import { InputProvider } from '../../context/InputContext'
import { useUser } from '../../context/UserContext'
import { ChatAttachment } from './ChatAttachment'
import { FigmaSelectionModal } from './FigmaSelectionModal'
import { InputSection } from './InputSection'
import { UserMessageHeader } from './UserMessageHeader'

export const ChatInputBox = ({
  content,
  isMainChat = false
}: {
  content?: MessageContent
  isMainChat?: boolean
}) => {
  const { isDraft } = useEditMode()
  const { user } = useUser()

  return (
    <AttachmentProvider attachment={content?.attachment}>
      {isMainChat ? (
        <>
          <ChatAttachment />
          <InputProvider text={content?.text}>
            <InputSection content={content} />
          </InputProvider>
        </>
      ) : (
        <InputProvider text={content?.text}>
          <UserMessageHeader
            picture={user.picture}
            username={user.username}
            isDraft={isDraft}
          />
          <InputSection content={content} />
          <ChatAttachment />
        </InputProvider>
      )}
      <FigmaSelectionModal />
    </AttachmentProvider>
  )
}
