import { useEffect } from 'react'
import type { MessageContent } from '../../../../shared/model'
import { AttachmentProvider } from '../../context/AttachmentContext'
import { useEditMode } from '../../context/EditModeContext'
import { useOverlay } from '../../context/OverlayContext'
import { ChatInputBox } from './ChatInputBox'
import { ChatInputBoxDnd } from './ChatInputBoxDnd'

export const ChatInputBoxWrapper = ({
  content,
  messageId
}: {
  content?: MessageContent
  messageId?: string
}) => {
  const { isEditMode } = useEditMode()
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
      <ChatInputBoxDnd>
        <ChatInputBox content={content} messageId={messageId} />
      </ChatInputBoxDnd>
    </AttachmentProvider>
  )
}
