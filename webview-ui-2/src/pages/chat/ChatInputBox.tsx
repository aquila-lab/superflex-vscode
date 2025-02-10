import { useEffect } from 'react'
import type { MessageContent } from '../../../../shared/model'
import { AttachmentProvider } from '../../context/AttachmentContext'
import { useEditMode } from '../../context/EditModeContext'
import { InputProvider, useInput } from '../../context/InputContext'
import { useUser } from '../../context/UserContext'
import { ChatAttachment } from './ChatAttachment'
import { InputSection } from './InputSection'
import { UserMessageHeader } from './UserMessageHeader'
import { useOverlay } from '../../context/OverlayContext'

export const ChatInputBox = ({
  content,
  messageId
}: {
  content?: MessageContent
  messageId?: string
}) => {
  const { isDraft, isMainTextbox, isEditMode } = useEditMode()
  const { user } = useUser()
  const { setActiveMessageId } = useOverlay()

  useEffect(() => {
    if (isEditMode) {
      setActiveMessageId(messageId ?? null)
    } else {
      setActiveMessageId(null)
    }
  }, [isEditMode, messageId, setActiveMessageId])

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
    </AttachmentProvider>
  )
}
