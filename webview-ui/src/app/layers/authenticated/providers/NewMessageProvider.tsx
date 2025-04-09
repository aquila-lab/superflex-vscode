import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  type Message,
  type MessageContent,
  Role
} from '../../../../../../shared/model'
import {
  EventRequestType,
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../../global/hooks/useConsumeMessage'
import { usePostMessage } from '../../global/hooks/usePostMessage'
import { useMessages } from './MessagesProvider'

const NewMessageContext = createContext<{
  message: Message | null
  isMessageProcessing: boolean
  isMessageStreaming: boolean
  isEnhanceComplete: boolean
  hasMessageStopped: boolean
  enhancedTextDelta: string
  sendMessageContent: (content: MessageContent) => void
  stopStreaming: (messageId?: string | null) => void
} | null>(null)

export const NewMessageProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage()
  const { messages, addMessages, removeMessagesFrom, setIdToLastUserMessage } =
    useMessages()

  const [message, setMessage] = useState<Message | null>(null)
  const [streamTextDelta, setStreamTextDelta] = useState('')
  const [enhancedTextDelta, setEnhancedTextDelta] = useState('')
  const [isMessageProcessing, setIsMessageProcessing] = useState(false)
  const [isMessageStreaming, setIsMessageStreaming] = useState(false)
  const [isEnhanceComplete, setIsEnhanceComplete] = useState(false)
  const [hasMessageStopped, setHasMessageStopped] = useState(false)

  const resetNewMessage = useCallback(() => {
    setHasMessageStopped(false)
    setIsMessageStreaming(false)
    setIsMessageProcessing(false)
    setIsEnhanceComplete(false)
    setMessage(null)
    setStreamTextDelta('')
    setEnhancedTextDelta('')
  }, [])

  const stopStreaming = useCallback(() => {
    postMessage(EventRequestType.STOP_MESSAGE)
    resetNewMessage()
  }, [postMessage, resetNewMessage])

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
        setEnhancedTextDelta('')
        return
      }

      if (payload.role === Role.User) {
        setIdToLastUserMessage(payload.id)
        return
      }

      if (payload.role === Role.Assistant && enhancedTextDelta) {
        payload.content.enhancedText = enhancedTextDelta
      }

      if (message && message.role === Role.Assistant) {
        payload.id = message.id
      }

      addMessages([payload])

      requestAnimationFrame(() => {
        setMessage(null)
        setStreamTextDelta('')
        setEnhancedTextDelta('')
      })
    },
    [addMessages, setIdToLastUserMessage, message, enhancedTextDelta]
  )

  const handleSendMessageContentResponse = useCallback((payload: boolean) => {
    if (payload) {
      setIsMessageProcessing(false)
      setIsMessageStreaming(false)
      setIsEnhanceComplete(false)
    }
  }, [])

  const handleMessage = useCallback(
    ({ command, payload, error }: TypedEventResponseMessage) => {
      // CRITICAL: Proper error handling required!
      // Never remove this check it will break the app.
      if (error) {
        resetNewMessage()
        return
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
        case EventResponseType.ENHANCED_PROMPT_DELTA:
          setEnhancedTextDelta(prev => prev + payload)
          break
        case EventResponseType.ENHANCE_PROMPT_COMPLETE:
          setIsEnhanceComplete(true)
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
      EventResponseType.STOP_MESSAGE,
      EventResponseType.ENHANCED_PROMPT_DELTA,
      EventResponseType.ENHANCE_PROMPT_COMPLETE
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

      if (content.fromMessageID) {
        const fromMessageID = content.fromMessageID
        queueMicrotask(() => {
          setIdToLastUserMessage(fromMessageID)
        })
      }

      postMessage(EventRequestType.SEND_MESSAGE, content)
    },
    [
      postMessage,
      messages,
      addMessages,
      removeMessagesFrom,
      stopStreaming,
      setIdToLastUserMessage
    ]
  )

  const value = useMemo(
    () => ({
      message,
      isMessageProcessing,
      isMessageStreaming,
      isEnhanceComplete,
      hasMessageStopped,
      enhancedTextDelta,
      sendMessageContent,
      stopStreaming
    }),
    [
      message,
      isMessageProcessing,
      isMessageStreaming,
      isEnhanceComplete,
      hasMessageStopped,
      enhancedTextDelta,
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
