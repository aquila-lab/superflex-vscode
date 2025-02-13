import { useEffect } from 'react'

import { ChatInputBoxDnd } from './ChatInputBoxDnd'
import type { MessageContent } from '../../../../../../shared/model'
import { useOverlay } from '../../../layer/authenticated/OverlayProvider'
import { ChatInputBox } from './ChatInputBox'
import { useEditMode } from './EditModeProvider'
import { AttachmentProvider } from './AttachmentProvider'

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
