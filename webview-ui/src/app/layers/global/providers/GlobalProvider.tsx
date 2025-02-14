import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { usePostMessage } from '../hooks/usePostMessage'
import {
  EventRequestType,
  type EventResponsePayload,
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../hooks/useConsumeMessage'

const GlobalContext = createContext<{
  isInitialized: boolean | null
  isLoggedIn: boolean | null
  config: Record<string, unknown> | null
  isFigmaAuthenticated: boolean | null
  setIsInitialized: (val: boolean) => void
  setIsLoggedIn: (val: boolean) => void
  connectFigma: () => void
  disconnectFigma: () => void
  signOut: () => void
} | null>(null)

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage()
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [config, setConfig] = useState<Record<string, unknown> | null>(null)
  const [isFigmaAuthenticated, setIsFigmaAuthenticated] = useState<
    boolean | null
  >(null)

  useEffect(() => {
    postMessage(EventRequestType.READY)
  }, [postMessage])

  const handleConfig = useCallback(
    (payload: EventResponsePayload[EventResponseType.CONFIG]) => {
      setConfig(payload)
    },
    []
  )

  const handleInitialized = useCallback(
    (payload: EventResponsePayload[EventResponseType.INITIALIZED]) => {
      const { isFigmaAuthenticated, isInitialized } = payload

      setIsFigmaAuthenticated(isFigmaAuthenticated)
      setIsInitialized(isInitialized)
    },
    []
  )

  const handleConnectFigma = useCallback(
    (payload: EventResponsePayload[EventResponseType.FIGMA_OAUTH_CONNECT]) => {
      setIsFigmaAuthenticated(payload)
    },
    []
  )

  const connectFigma = useCallback(() => {
    postMessage(EventRequestType.FIGMA_OAUTH_CONNECT)
  }, [postMessage])

  const disconnectFigma = useCallback(() => {
    postMessage(EventRequestType.FIGMA_OAUTH_DISCONNECT)
  }, [postMessage])

  const signOut = useCallback(() => {
    postMessage(EventRequestType.SIGN_OUT)
  }, [postMessage])

  const handleDisconnectFigma = useCallback(() => {
    setIsFigmaAuthenticated(false)
  }, [])

  const handleMessage = useCallback(
    ({ command, payload }: TypedEventResponseMessage) => {
      switch (command) {
        case EventResponseType.CONFIG: {
          handleConfig(payload)
          break
        }
        case EventResponseType.INITIALIZED: {
          handleInitialized(payload)
          break
        }
        case EventResponseType.FIGMA_OAUTH_CONNECT: {
          handleConnectFigma(payload)
          break
        }
        case EventResponseType.FIGMA_OAUTH_DISCONNECT: {
          handleDisconnectFigma()
          break
        }
      }
    },
    [handleConfig, handleInitialized, handleConnectFigma, handleDisconnectFigma]
  )

  useConsumeMessage(
    [
      EventResponseType.CONFIG,
      EventResponseType.INITIALIZED,
      EventResponseType.FIGMA_OAUTH_CONNECT,
      EventResponseType.FIGMA_OAUTH_DISCONNECT
    ],
    handleMessage
  )

  const value = useMemo(
    () => ({
      isInitialized,
      isLoggedIn,
      config,
      isFigmaAuthenticated,
      setIsInitialized,
      setIsLoggedIn,
      connectFigma,
      disconnectFigma,
      signOut
    }),
    [
      isInitialized,
      isLoggedIn,
      config,
      isFigmaAuthenticated,
      connectFigma,
      disconnectFigma,
      signOut
    ]
  )

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  )
}

export function useGlobal() {
  const context = useContext(GlobalContext)

  if (!context) {
    throw new Error('Global context provider not set')
  }

  return context
}
