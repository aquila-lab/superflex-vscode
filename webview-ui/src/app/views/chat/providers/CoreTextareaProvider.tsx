import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef
} from 'react'
import {
  EventRequestType,
  type EventResponsePayload,
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../../../../shared/protocol'
import { useNewMessage } from '../../../layers/authenticated/providers/NewMessageProvider'
import { useConsumeMessage } from '../../../layers/global/hooks/useConsumeMessage'
import { usePostMessage } from '../../../layers/global/hooks/usePostMessage'
import { useAttachment } from './AttachmentProvider'
import { useEditMode } from './EditModeProvider'
import { useFiles } from './FilesProvider'
import { useInput } from './InputProvider'
import { useSendMessage } from './SendMessageProvider'

const TextareaHandlersContext = createContext<{
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  handlePaste: (e: ClipboardEvent<HTMLTextAreaElement>) => void
} | null>(null)

export const TextareaHandlersProvider = ({
  children
}: { children: ReactNode }) => {
  const postMessage = usePostMessage()
  const { setInput, input, focusInput } = useInput()
  const { selectFile, setPreviewedFile } = useFiles()
  const { isMainTextarea } = useEditMode()
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()
  const { figmaAttachment, imageAttachment, isFigmaLoading } = useAttachment()
  const { sendMessage } = useSendMessage()
  const isAwaiting = useRef(false)

  const isDisabled = useMemo(
    () => isMessageProcessing || isMessageStreaming || isFigmaLoading,
    [isMessageProcessing, isMessageStreaming, isFigmaLoading]
  )

  const handleFocusChat = useCallback(() => {
    focusInput()
  }, [focusInput])

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value),
    [setInput]
  )

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

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const text = e.clipboardData.getData('text')
      postMessage(EventRequestType.PASTE_COPIED_CODE, { text })
      isAwaiting.current = true
    },
    [postMessage]
  )

  const handlePasteResponse = useCallback(
    (payload: EventResponsePayload[EventResponseType.PASTE_COPIED_CODE]) => {
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

  const handleMessage = useCallback(
    ({ command, payload, error }: TypedEventResponseMessage) => {
      // CRITICAL: Proper error handling required!
      // Never remove this check it will break the app.
      if (error) {
        return
      }

      switch (command) {
        case EventResponseType.FOCUS_CHAT_INPUT: {
          handleFocusChat()
          break
        }
        case EventResponseType.PASTE_COPIED_CODE: {
          handlePasteResponse(payload)
          break
        }
      }
    },
    [handleFocusChat, handlePasteResponse]
  )

  useConsumeMessage(
    [EventResponseType.FOCUS_CHAT_INPUT, EventResponseType.PASTE_COPIED_CODE],
    handleMessage
  )

  const value = useMemo(
    () => ({
      handleInputChange,
      handleKeyDown,
      handlePaste
    }),
    [handleInputChange, handleKeyDown, handlePaste]
  )

  return (
    <TextareaHandlersContext.Provider value={value}>
      {children}
    </TextareaHandlersContext.Provider>
  )
}

export const useTextareaHandlers = () => {
  const context = useContext(TextareaHandlersContext)

  if (!context) {
    throw new Error(
      'useTextareaHandlers must be used within TextareaHandlersProvider'
    )
  }

  return context
}
