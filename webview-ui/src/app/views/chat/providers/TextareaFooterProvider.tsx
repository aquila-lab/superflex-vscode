import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode
} from 'react'
import { useNewMessage } from '../../../layers/authenticated/providers/NewMessageProvider'
import { useAttachment } from '../providers/AttachmentProvider'
import { useEditMode } from '../providers/EditModeProvider'
import { useInput } from '../providers/InputProvider'
import { useSendMessage } from '../providers/SendMessageProvider'

const TextareaFooterContext = createContext<{
  isEditMode: boolean
  isMainTextarea: boolean
  isDisabled: boolean
  hasContent: boolean
  isFigmaLoading: boolean
  handleStop: () => void
  handleSend: () => void
} | null>(null)

export const TextareaFooterProvider = ({
  children
}: { children: ReactNode }) => {
  const { input } = useInput()
  const { isEditMode, isMainTextarea } = useEditMode()
  const { isMessageProcessing, isMessageStreaming, stopStreaming } =
    useNewMessage()
  const { figmaAttachment, imageAttachment, isFigmaLoading } = useAttachment()
  const { sendMessage } = useSendMessage()

  const isDisabled = useMemo(
    () => Boolean(isMessageProcessing || isMessageStreaming || isFigmaLoading),
    [isMessageProcessing, isMessageStreaming, isFigmaLoading]
  )

  const hasContent = useMemo(
    () => Boolean(input.length > 0 || figmaAttachment || imageAttachment),
    [input.length, figmaAttachment, imageAttachment]
  )

  const handleStop = useCallback(() => {
    stopStreaming()
  }, [stopStreaming])

  const handleSend = useCallback(() => {
    sendMessage()
  }, [sendMessage])

  const value = useMemo(
    () => ({
      isEditMode,
      isMainTextarea,
      isDisabled,
      hasContent,
      isFigmaLoading,
      handleStop,
      handleSend
    }),
    [
      isEditMode,
      isMainTextarea,
      isDisabled,
      hasContent,
      isFigmaLoading,
      handleStop,
      handleSend
    ]
  )

  return (
    <TextareaFooterContext.Provider value={value}>
      {children}
    </TextareaFooterContext.Provider>
  )
}

export const useTextareaFooter = () => {
  const context = useContext(TextareaFooterContext)

  if (!context) {
    throw new Error(
      'useTextareaFooter must be used within TextareaFooterProvider'
    )
  }

  return context
}
