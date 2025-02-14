import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo
} from 'react'
import { useNewMessage } from '../../../layers/authenticated/providers/NewMessageProvider'
import { useAttachment } from './AttachmentProvider'
import { useEditMode } from './EditModeProvider'
import { useFiles } from './FilesProvider'
import { useInput } from './InputProvider'

export const SendMessageContext = createContext<{
  sendMessage: () => void
} | null>(null)

export const SendMessageProvider = ({ children }: { children: ReactNode }) => {
  const { input, setInput, messageId } = useInput()
  const { selectedFiles, clearManuallySelectedFiles } = useFiles()
  const { sendMessageContent, stopStreaming } = useNewMessage()
  const { figmaAttachment, imageAttachment, removeAttachment } = useAttachment()
  const { isMainTextarea } = useEditMode()

  const sendMessage = useCallback(() => {
    const sm = () => {
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

    if (isMainTextarea) {
      sm()
      return
    }

    stopStreaming(messageId)
    sm()
  }, [
    messageId,
    isMainTextarea,
    figmaAttachment,
    imageAttachment,
    input,
    sendMessageContent,
    setInput,
    removeAttachment,
    selectedFiles,
    clearManuallySelectedFiles,
    stopStreaming
  ])

  const value = useMemo(() => ({ sendMessage }), [sendMessage])

  return (
    <SendMessageContext.Provider value={value}>
      {children}
    </SendMessageContext.Provider>
  )
}

export function useSendMessage() {
  const context = useContext(SendMessageContext)

  if (!context) {
    throw new Error('SendMessage context provider not set')
  }

  return context
}
