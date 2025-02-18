import { useCallback, useState, type ReactNode } from 'react'
import { EventResponseType } from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../../global/hooks/useConsumeMessage'
import { LoadingBar } from '../../../../common/ui/LoadingBar'
import { RELOAD_DURATION } from '../../../../common/utils'
import { useUser } from '../providers/UserProvider'
import { useThreads } from '../providers/ThreadsProvider'

export const ReloadHandler = ({ children }: { children: ReactNode }) => {
  const [isReloading, setIsReloading] = useState(false)
  const {fetchSubscription, fetchUserInfo} = useUser()
  const {fetchThreads} = useThreads()

  const handleReload = useCallback(() => {
    setIsReloading(true)
    fetchSubscription()
    fetchUserInfo()
    fetchThreads()

    const timer = setTimeout(() => {
      setIsReloading(false)
    }, RELOAD_DURATION)

    return () => clearTimeout(timer)
  }, [])

  useConsumeMessage(EventResponseType.REFRESH, handleReload)

  return (
    <>
      {isReloading && <LoadingBar className='absolute top-0.5 left-0 z-20' />}
      {children}
    </>
  )
}
