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
} from '../../../../shared/protocol'
import { TextareaAutosize } from '../../components/ui/TextareaAutosize'
import { useAttachment } from '../../context/AttachmentContext'
import { useEditMode } from '../../context/EditModeContext'
import { useFiles } from '../../context/FilesProvider'
import { useInput } from '../../context/InputContext'
import { useNewMessage } from '../../context/NewMessageContext'
import { useConsumeMessage } from '../../hooks/useConsumeMessage'
import { usePostMessage } from '../../hooks/usePostMessage'

export const ChatTextarea = () => {
  const postMessage = usePostMessage()
  const { input, inputRef, setInput, focusInput, messageId } = useInput()
  const {
    selectedFiles,
    clearManuallySelectedFiles,
    selectFile,
    setPreviewedFile
  } = useFiles()
  const { isEditMode } = useEditMode()
  const { sendMessageContent, isMessageProcessing, isMessageStreaming } =
    useNewMessage()
  const { figmaAttachment, imageAttachment, removeAttachment, isFigmaLoading } =
    useAttachment()
  const isDisabled = isMessageProcessing || isMessageStreaming || isFigmaLoading
  const isAwaiting = useRef(false)

  const handleKeyDown = useCallback(
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
          attachment:
            figmaAttachment || imageAttachment
              ? {
                  figma: figmaAttachment ?? undefined,
                  image: imageAttachment ?? undefined
                }
              : undefined,
          fromMessageID: messageId ?? undefined,
          files: selectedFiles
        })
        setInput('')
        removeAttachment()
        clearManuallySelectedFiles()
      }
    },
    [
      isDisabled,
      messageId,
      input,
      figmaAttachment,
      imageAttachment,
      sendMessageContent,
      selectedFiles,
      removeAttachment,
      setInput,
      clearManuallySelectedFiles
    ]
  )

  const handleFocusChat = useCallback(() => focusInput(), [focusInput])

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
