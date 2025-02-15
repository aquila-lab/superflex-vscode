import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../../layers/authenticated/providers/UserProvider'
import { useGlobal } from '../../../layers/global/providers/GlobalProvider'

const SettingsHandlersContext = createContext<{
  handleSubscribe: () => void
  handleManageBilling: () => void
  handleReturnToChat: () => void
  handleConnectFigma: () => void
  handleDisconnectFigma: () => void
  handleSignOut: () => void
} | null>(null)

export const SettingsHandlersProvider = ({
  children
}: { children: ReactNode }) => {
  const navigate = useNavigate()
  const { connectFigma, disconnectFigma, signOut } = useGlobal()
  const { fetchSubscription, manageBilling, subscribe } = useUser()

  const handleReturnToChat = useCallback(() => {
    navigate('/chat')
  }, [navigate])

  const handleConnectFigma = useCallback(() => {
    connectFigma()
  }, [connectFigma])

  const handleDisconnectFigma = useCallback(() => {
    disconnectFigma()
  }, [disconnectFigma])

  const handleSignOut = useCallback(() => {
    signOut()
  }, [signOut])

  const handleManageBilling = useCallback(() => {
    manageBilling()
  }, [manageBilling])

  const handleSubscribe = useCallback(() => {
    subscribe()
  }, [subscribe])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const value = useMemo(
    () => ({
      handleReturnToChat,
      handleConnectFigma,
      handleDisconnectFigma,
      handleSignOut,
      handleManageBilling,
      handleSubscribe
    }),
    [
      handleReturnToChat,
      handleConnectFigma,
      handleDisconnectFigma,
      handleSignOut,
      handleManageBilling,
      handleSubscribe
    ]
  )

  return (
    <SettingsHandlersContext.Provider value={value}>
      {children}
    </SettingsHandlersContext.Provider>
  )
}

export function useSettingsHandlers() {
  const context = useContext(SettingsHandlersContext)

  if (!context) {
    throw new Error('Settings handlers context provider not set')
  }

  return context
}
