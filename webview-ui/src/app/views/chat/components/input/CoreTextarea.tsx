import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useCallback,
  useRef
} from 'react'
import {
  EventRequestType,
  type EventResponseMessage,
  EventResponseType
} from '../../../../../../../shared/protocol'
import { TextareaAutosize } from '../../../../../common/ui/TextareaAutosize'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { useConsumeMessage } from '../../../../layers/global/hooks/useConsumeMessage'
import { usePostMessage } from '../../../../layers/global/hooks/usePostMessage'
import { useAttachment } from '../../providers/AttachmentProvider'
import { useEditMode } from '../../providers/EditModeProvider'
import { useFiles } from '../../providers/FilesProvider'
import { useInput } from '../../providers/InputProvider'
import { useSendMessage } from '../../providers/SendMessageProvider'

export const CoreTextarea = () => {
  const postMessage = usePostMessage()
  const { input, inputRef, setInput, focusInput } = useInput()
  const { selectFile, setPreviewedFile } = useFiles()
  const { isEditMode, isMainTextarea } = useEditMode()
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()
  const { figmaAttachment, imageAttachment, isFigmaLoading } = useAttachment()
  const { sendMessage } = useSendMessage()
  const isDisabled = isMessageProcessing || isMessageStreaming || isFigmaLoading
  const isAwaiting = useRef(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const hasContent = input.length || figmaAttachment || imageAttachment
      const isEnterPressed = e.key === 'Enter' && !e.shiftKey

      if (!isEnterPressed) {
        return
      }

      const canSubmit = isMainTextarea
        ? !isDisabled && hasContent
        : !isFigmaLoading && hasContent

      if (canSubmit) {
        e.preventDefault()
        sendMessage()
      }
    },
    [
      isMainTextarea,
      isDisabled,
      sendMessage,
      figmaAttachment,
      imageAttachment,
      input.length,
      isFigmaLoading
    ]
  )
  const handleFocusChat = useCallback(() => {
    focusInput()
  }, [focusInput])

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const text = e.clipboardData.getData('text')
      postMessage(EventRequestType.PASTE_COPIED_CODE, { text })
      isAwaiting.current = true
    },
    [postMessage]
  )

  const handlePasteResponse = useCallback(
    ({
      payload
    }: EventResponseMessage<EventResponseType.PASTE_COPIED_CODE>) => {
      if (payload && isAwaiting.current) {
        isAwaiting.current = false
        selectFile(payload)
        setPreviewedFile(payload)

        setInput(prev => {
          if (payload.content) {
            return prev.replace(payload.content, '')
          }
          return prev
        })
      }
    },
    [selectFile, setInput, setPreviewedFile]
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value),
    [setInput]
  )

  useConsumeMessage(EventResponseType.FOCUS_CHAT_INPUT, handleFocusChat)
  useConsumeMessage(EventResponseType.PASTE_COPIED_CODE, handlePasteResponse)

  if (!isEditMode && !input.length) {
    return null
  }

  return (
    <div className='flex-1'>
      <TextareaAutosize
        ref={inputRef}
        autoFocus
        value={input}
        placeholder='Describe your UI component... (⌘+; to focus)'
        className='border-0 shadow-none'
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        disabled={!isEditMode}
      />
    </div>
  )
}
