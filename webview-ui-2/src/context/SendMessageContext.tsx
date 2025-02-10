import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo
} from 'react'
import { useAttachment } from './AttachmentContext'
import { useFiles } from './FilesProvider'
import { useInput } from './InputContext'
import { useNewMessage } from './NewMessageContext'
import { useEditMode } from './EditModeContext'

export const SendMessageContext = createContext<{
  sendMessage: () => void
} | null>(null)

export const SendMessageProvider = ({ children }: { children: ReactNode }) => {
  const { input, setInput, messageId } = useInput()
  const { selectedFiles, clearManuallySelectedFiles } = useFiles()
  const { sendMessageContent, stopStreaming } = useNewMessage()
  const { figmaAttachment, imageAttachment, removeAttachment } = useAttachment()
  const { isMainTextbox } = useEditMode()

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

    if (isMainTextbox) {
      sm()
      return
    }

    stopStreaming(messageId)
    sm()
  }, [
    messageId,
    isMainTextbox,
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
