import type { ReactNode } from 'react'
import { useUser } from '../context/UserContext'

export const LoadingGuard = ({ children }: { children: ReactNode }) => {
  const { isUserLoading, isSubscriptionLoading } = useUser()

  if (isUserLoading || isSubscriptionLoading) {
    return null
  }

  return children
}
