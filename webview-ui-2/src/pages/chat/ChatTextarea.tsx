import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useCallback,
  useEffect
} from 'react'
import { EventResponseType } from '../../../../shared/protocol'
import { TextareaAutosize } from '../../components/ui/TextareaAutosize'
import { useAttachment } from '../../context/AttachmentContext'
import { useEditMode } from '../../context/EditModeContext'
import { useFiles } from '../../context/FilesProvider'
import { useInput } from '../../context/InputContext'
import { useNewMessage } from '../../context/NewMessageContext'
import { useConsumeMessage } from '../../hooks/useConsumeMessage'

export const ChatTextarea = () => {
  const { input, inputRef, setInput, focusInput } = useInput()
  const { selectedFiles, clearManuallySelectedFiles } = useFiles()
  const { isEditMode } = useEditMode()
  const isDisabled = false
  const messageId = ''

  const { sendMessageContent } = useNewMessage()
  const { figmaAttachment, removeAttachment } = useAttachment()

  const handleOnKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        !isDisabled &&
        (input.length || figmaAttachment) &&
        e.key === 'Enter' &&
        !e.shiftKey
      ) {
        e.preventDefault()
        sendMessageContent({
          text: input,
          attachment: figmaAttachment
            ? {
                figma: figmaAttachment
              }
            : undefined,
          fromMessageID: messageId,
          files: selectedFiles
        })
        setInput('')
        removeAttachment()
        clearManuallySelectedFiles()
      }
    },
    [
      input,
      figmaAttachment,
      sendMessageContent,
      selectedFiles,
      removeAttachment,
      setInput,
      clearManuallySelectedFiles
    ]
  )

  const handleFocusChat = useCallback(() => focusInput(), [focusInput])

  const handleOnPaste = useCallback(
    (_e: ClipboardEvent<HTMLTextAreaElement>) => {
      // TODO
    },
    []
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value),
    [setInput]
  )

  useConsumeMessage(EventResponseType.FOCUS_CHAT_INPUT, handleFocusChat)

  return (
    <div className='flex-1'>
      <TextareaAutosize
        ref={inputRef}
        autoFocus
        value={input}
        placeholder='Describe your UI component... (⌘+; to focus)'
        className='border-0 shadow-none'
        onChange={handleInputChange}
        onKeyDown={handleOnKeyDown}
        onPaste={handleOnPaste}
        disabled={!isEditMode}
      />
    </div>
  )
}
