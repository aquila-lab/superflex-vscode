import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { type Message, Role } from '../../../../../../shared/model'
import { useThreads } from './ThreadsProvider'

const MessagesContext = createContext<{
  hasMessages: boolean
  messages: Message[]
  addMessages: (messages: Message[]) => void
  updateUserMessage: (messageId: string, text: string) => void
  getMessage: (messageId: string) => Message | undefined
  removeMessagesFrom: (messageId: string) => void
  setIdToLastUserMessage: (messageId: string) => void
} | null>(null)

interface MessagesProviderProps {
  children: ReactNode
}

export const MessagesProvider = ({ children }: MessagesProviderProps) => {
  const { currentThread } = useThreads()

  const [messages, setMessages] = useState<Message[]>([])

  const hasMessages = useMemo(() => messages.length > 0, [messages])

  useEffect(() => {
    if (currentThread) {
      setMessages([...currentThread.messages])
    } else {
      setMessages([])
    }
  }, [currentThread])

  const removeMessagesFrom = useCallback((messageId: string) => {
    setMessages(prev => {
      const messageIndex = prev.findIndex(msg => msg.id === messageId)
      if (messageIndex === -1) {
        return prev
      }
      return prev.slice(0, messageIndex)
    })
  }, [])

  const getMessage = useCallback(
    (messageId: string) => {
      return messages.find(message => message.id === messageId)
    },
    [messages]
  )

  const addMessages = useCallback((newMessages: Message[]) => {
    setMessages(prev => {
      if (prev.length === 0) {
        return newMessages
      }
      return [...prev, ...newMessages]
    })
  }, [])

  const updateUserMessage = useCallback((messageId: string, text: string) => {
    setMessages(prev =>
      prev.map(message => {
        if (message.id === messageId && message.role === Role.User) {
          return {
            ...message,
            content: {
              text
            },
            updatedAt: new Date()
          }
        }
        return message
      })
    )
  }, [])

  const setIdToLastUserMessage = useCallback((messageId: string) => {
    setMessages(prev => {
      const lastUserMessage = prev.findLast(
        message => message.role === Role.User
      )
      if (lastUserMessage) {
        lastUserMessage.id = messageId
      }
      return prev
    })
  }, [])

  const value = useMemo(
    () => ({
      hasMessages,
      messages,
      addMessages,
      updateUserMessage,
      getMessage,
      removeMessagesFrom,
      setIdToLastUserMessage
    }),
    [
      hasMessages,
      messages,
      addMessages,
      updateUserMessage,
      getMessage,
      removeMessagesFrom,
      setIdToLastUserMessage
    ]
  )

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  )
}

export const useMessages = () => {
  const context = useContext(MessagesContext)

  if (!context) {
    throw new Error('useMessages must be used within MessagesProvider')
  }

  return context
}
