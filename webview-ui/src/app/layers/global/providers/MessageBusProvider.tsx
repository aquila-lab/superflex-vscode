import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react'
import type {
  EventResponseType,
  TypedEventResponseMessage
} from '../../../../../../shared/protocol'
import type { MessageHandler } from '../../../../common/utils'

const MessageBusContext = createContext<{
  subscribe: (event: EventResponseType, handler: MessageHandler) => () => void
} | null>(null)

export function MessageBusProvider({ children }: { children: ReactNode }) {
  const handlers = useRef(new Map<EventResponseType, Set<MessageHandler>>())

  const handleMessage = useCallback((event: MessageEvent) => {
    const message = event.data as TypedEventResponseMessage
    const eventHandlers = handlers.current.get(message.command)

    if (eventHandlers) {
      eventHandlers.forEach(handler => handler(message))
    }
  }, [])

  const subscribe = useCallback(
    (event: EventResponseType, handler: MessageHandler) => {
      if (!handlers.current.has(event)) {
        handlers.current.set(event, new Set())
      }

      const eventHandlers = handlers.current.get(event)
      if (eventHandlers) {
        eventHandlers.add(handler)
      }

      return () => {
        if (eventHandlers) {
          eventHandlers.delete(handler)

          if (eventHandlers.size === 0) {
            handlers.current.delete(event)
          }
        }
      }
    },
    []
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  const value = useMemo(() => ({ subscribe }), [subscribe])

  return (
    <MessageBusContext.Provider value={value}>
      {children}
    </MessageBusContext.Provider>
  )
}

export const useMessageBus = () => {
  const context = useContext(MessageBusContext)

  if (!context) {
    throw new Error('useMessageBus must be used within MessageBusProvider')
  }

  return context
}
