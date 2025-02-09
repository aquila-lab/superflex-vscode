import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobal } from '../context/GlobalContext'
import { useUser } from '../context/UserContext'

export const LoadingGuard = ({ children }: { children: ReactNode }) => {
  const { isInitialized } = useGlobal()
  const { isUserLoading, isSubscriptionLoading } = useUser()
  const navigate = useNavigate()

  if (isUserLoading || isSubscriptionLoading || isInitialized === null) {
    return null
  }

  if (!isInitialized) {
    navigate('/open-project', { replace: true })
    return null
  }

  return children
}
