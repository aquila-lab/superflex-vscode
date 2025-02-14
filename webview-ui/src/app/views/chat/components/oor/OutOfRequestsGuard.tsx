import type { ReactNode } from 'react'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { OutOfRequests } from './OutOfRequests'

export const OutOfRequestsGuard = ({ children }: { children: ReactNode }) => {
  const { isOutOfRequests } = useUser()

  if (isOutOfRequests) {
    return <OutOfRequests />
  }

  return children
}
