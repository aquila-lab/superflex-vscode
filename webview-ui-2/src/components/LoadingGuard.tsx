import type { ReactNode } from 'react'
import { useUser } from '../context/UserContext'

export const LoadingGuard = ({ children }: { children: ReactNode }) => {
  const { isUserLoading } = useUser()

  if (isUserLoading) {
    return null
  }

  return children
}
