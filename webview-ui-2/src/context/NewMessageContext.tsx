import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import { type Message, type MessageContent, Role } from '../../../shared/model'
import {
  EventRequestType,
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../shared/protocol'
import { useConsumeMessage } from '../hooks/useConsumeMessage'
import { usePostMessage } from '../hooks/usePostMessage'
import { useMessages } from './MessagesContext'

const NewMessageContext = createContext<{
  message: Message | null
  isMessageProcessing: boolean
  isMessageStreaming: boolean
  hasMessageStopped: boolean
  sendMessageContent: (content: MessageContent) => void
  stopStreaming: (messageId?: string | null) => void
} | null>(null)

export const NewMessageProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage()
  const { messages, addMessages, popMessage, removeMessagesFrom } =
    useMessages()

  const [message, setMessage] = useState<Message | null>(null)
  const [streamTextDelta, setStreamTextDelta] = useState('')
  const [isMessageProcessing, setIsMessageProcessing] = useState(false)
  const [isMessageStreaming, setIsMessageStreaming] = useState(false)
  const [hasMessageStopped, setHasMessageStopped] = useState(false)

  const resetNewMessage = useCallback(() => {
    setHasMessageStopped(false)
    setIsMessageStreaming(false)
    setIsMessageProcessing(false)
    setMessage(null)
    setStreamTextDelta('')
  }, [])

  const stopStreaming = useCallback(
    (messageId?: string | null) => {
      postMessage(EventRequestType.STOP_MESSAGE)
      popMessage(messageId)
      resetNewMessage()
    },
    [postMessage, popMessage, resetNewMessage]
  )

  const handleMessageDelta = useCallback(
    (payload: string) => {
      if (hasMessageStopped) {
        return
      }

      if (!isMessageStreaming) {
        setIsMessageStreaming(true)
      }

      setStreamTextDelta(prev => prev + payload)

      setMessage(prev => {
        if (!prev) {
          return {
            id: uuidv4(),
            threadID: messages[0]?.threadID || uuidv4(),
            role: Role.Assistant,
            content: {
              text: payload
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }

        return {
          ...prev,
          content: {
            text: streamTextDelta + payload
          },
          updatedAt: new Date()
        }
      })
    },
    [messages, streamTextDelta, isMessageStreaming, hasMessageStopped]
  )

  const handleMessageComplete = useCallback(
    (payload: Message) => {
      if (!payload) {
        setMessage(null)
        setStreamTextDelta('')
        return
      }

      addMessages([payload])

      setMessage(null)
      setStreamTextDelta('')
    },
    [addMessages]
  )

  const handleSendMessageContentResponse = useCallback((payload: boolean) => {
    if (payload) {
      setIsMessageProcessing(false)
      setIsMessageStreaming(false)
    }
  }, [])

  const handleMessage = useCallback(
    ({ command, payload, error }: TypedEventResponseMessage) => {
      if (error) {
        resetNewMessage()
      }

      switch (command) {
        case EventResponseType.MESSAGE_TEXT_DELTA:
          handleMessageDelta(payload)
          break
        case EventResponseType.MESSAGE_COMPLETE:
          handleMessageComplete(payload)
          break
        case EventResponseType.SEND_MESSAGE:
          handleSendMessageContentResponse(payload)
          break
      }
    },
    [
      handleMessageDelta,
      handleMessageComplete,
      handleSendMessageContentResponse,
      resetNewMessage
    ]
  )

  useConsumeMessage(
    [
      EventResponseType.MESSAGE_TEXT_DELTA,
      EventResponseType.MESSAGE_COMPLETE,
      EventResponseType.SEND_MESSAGE,
      EventResponseType.STOP_MESSAGE
    ],
    handleMessage
  )
  const sendMessageContent = useCallback(
    (content: MessageContent): void => {
      if (!(content.text || content.attachment)) {
        return
      }

      const userMessage: Message = {
        id: uuidv4(),
        threadID: messages[0]?.threadID || uuidv4(),
        role: Role.User,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (content.fromMessageID) {
        stopStreaming()
        removeMessagesFrom(content.fromMessageID)
      }

      setHasMessageStopped(false)
      setIsMessageProcessing(true)
      addMessages([userMessage])

      postMessage(EventRequestType.SEND_MESSAGE, content)
    },
    [postMessage, messages, addMessages, removeMessagesFrom, stopStreaming]
  )

  const value = useMemo(
    () => ({
      message,
      isMessageProcessing,
      isMessageStreaming,
      hasMessageStopped,
      sendMessageContent,
      stopStreaming
    }),
    [
      message,
      isMessageProcessing,
      isMessageStreaming,
      hasMessageStopped,
      sendMessageContent,
      stopStreaming
    ]
  )

  return (
    <NewMessageContext.Provider value={value}>
      {children}
    </NewMessageContext.Provider>
  )
}

export const useNewMessage = () => {
  const context = useContext(NewMessageContext)

  if (!context) {
    throw new Error('useNewMessage must be used within NewMessageProvider')
  }

  return context
}
