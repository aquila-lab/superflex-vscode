import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingView } from '../../../views/loading/LoadingView'
import { useUser } from '../providers/UserProvider'
import { useGlobal } from '../../global/providers/GlobalProvider'
export const LoadingGuard = ({ children }: { children: ReactNode }) => {
  const { isInitialized } = useGlobal()
  const { isUserLoading, isSubscriptionLoading } = useUser()
  const navigate = useNavigate()

  if (isUserLoading || isSubscriptionLoading || isInitialized === null) {
    console.info(`User loading: ${isUserLoading}`)
    console.info(`Subscription loading: ${isSubscriptionLoading}`)
    console.info(`Initialized: ${isInitialized}`)
    return <LoadingView />
  }

  if (!isInitialized) {
    navigate('/open-project', { replace: true })
    return null
  }

  return children
}
