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
  messageId
}: {
  content?: MessageContent
  messageId?: string
}) => {
  const { isDraft, isMainTextbox } = useEditMode()
  const { user } = useUser()

  return (
    <AttachmentProvider attachment={content?.attachment}>
      {isMainTextbox ? (
        <>
          <ChatAttachment />
          <InputProvider text={content?.text}>
            <InputSection content={content} />
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
