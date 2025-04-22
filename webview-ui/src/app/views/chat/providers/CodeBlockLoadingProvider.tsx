import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import {
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../../../layers/global/hooks/useConsumeMessage'
import { useNewMessage } from '../../../layers/authenticated/providers/NewMessageProvider'

const CodeBlockLoadingContext = createContext<{
  loadingStates: Record<string, boolean>
  setLoading: (key: string) => void
  clearLoadingStates: () => void
  isLoading: (key: string) => boolean
} | null>(null)

export const CodeBlockLoadingProvider = ({
  children
}: {
  children: ReactNode
}) => {
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  )

  const setLoading = useCallback((key: string) => {
    setLoadingStates(() => ({
      [key]: true
    }))
  }, [])

  const clearLoadingStates = useCallback(() => {
    setLoadingStates({})
  }, [])

  const isLoading = useCallback(
    (key: string) => {
      if (!isMessageProcessing && !isMessageStreaming) {
        return false
      }

      return Boolean(loadingStates[key])
    },
    [loadingStates, isMessageProcessing, isMessageStreaming]
  )

  const handleNewMessage = useCallback(() => {
    clearLoadingStates()
  }, [clearLoadingStates])

  const handleMessage = useCallback(
    ({ command }: TypedEventResponseMessage) => {
      switch (command) {
        case EventResponseType.MESSAGE_COMPLETE:
          handleNewMessage()
          break
        case EventResponseType.SEND_MESSAGE:
          handleNewMessage()
          break
      }
    },
    [handleNewMessage]
  )

  useConsumeMessage(
    [EventResponseType.MESSAGE_COMPLETE, EventResponseType.SEND_MESSAGE],
    handleMessage
  )

  const value = useMemo(
    () => ({
      loadingStates,
      setLoading,
      clearLoadingStates,
      isLoading
    }),
    [loadingStates, setLoading, clearLoadingStates, isLoading]
  )

  return (
    <CodeBlockLoadingContext.Provider value={value}>
      {children}
    </CodeBlockLoadingContext.Provider>
  )
}

export const useCodeBlockLoading = () => {
  const context = useContext(CodeBlockLoadingContext)

  if (!context) {
    throw new Error(
      'useCodeBlockLoading must be used within CodeBlockLoadingProvider'
    )
  }

  return context
}
