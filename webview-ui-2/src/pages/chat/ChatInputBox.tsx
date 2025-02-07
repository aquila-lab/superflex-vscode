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
  isMainChat = false,
  messageId
}: {
  content?: MessageContent
  isMainChat?: boolean
  messageId?: string
}) => {
  const { isDraft } = useEditMode()
  const { user } = useUser()

  return (
    <AttachmentProvider attachment={content?.attachment}>
      {isMainChat ? (
        <>
          <ChatAttachment isMainChat />
          <InputProvider text={content?.text}>
            <InputSection content={content} isMainChat />
          </InputProvider>
        </>
      ) : (
        <InputProvider text={content?.text} id={messageId}>
          <UserMessageHeader
            picture={user.picture}
            username={user.username}
            isDraft={isDraft}
          />
          <InputSection content={content} />
        </InputProvider>
      )}
      <FigmaSelectionModal />
    </AttachmentProvider>
  )
}
