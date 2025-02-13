import { useEffect } from 'react'

import type { MessageContent } from '../../../../../../shared/model'
import { useOverlay } from '../../../layer/authenticated/OverlayProvider'
import { AttachmentProvider } from './AttachmentProvider'
import { ChatInputBox } from './ChatInputBox'
import { ChatInputBoxDnd } from './ChatInputBoxDnd'
import { useEditMode } from './EditModeProvider'

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
        <ChatInputBox
          content={content}
          messageId={messageId}
        />
      </ChatInputBoxDnd>
    </AttachmentProvider>
  )
}
