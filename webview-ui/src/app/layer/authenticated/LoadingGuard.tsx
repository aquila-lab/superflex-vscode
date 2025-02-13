import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingView } from '../../view/loading/LoadingView'
import { useGlobal } from '../global/GlobalProvider'
import { useUser } from './UserProvider'

export const LoadingGuard = ({ children }: { children: ReactNode }) => {
  const { isInitialized } = useGlobal()
  const { isUserLoading, isSubscriptionLoading } = useUser()
  const navigate = useNavigate()

  if (isUserLoading || isSubscriptionLoading || isInitialized === null) {
    return <LoadingView />
  }

  if (!isInitialized) {
    navigate('/open-project', { replace: true })
    return null
  }

  return children
}
