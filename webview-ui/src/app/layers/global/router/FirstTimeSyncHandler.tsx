import { type ReactNode, useCallback } from 'react'
import { useConsumeMessage } from '../hooks/useConsumeMessage'
import {
  type EventResponseMessage,
  EventResponseType
} from '../../../../../../shared/protocol'
import { useGlobal } from '../providers/GlobalProvider'

export const FirstTimeSyncHandler = ({ children }: { children: ReactNode }) => {
  const { setIsFirstTimeSynced } = useGlobal()

  const handleSyncProgress = useCallback(
    ({
      payload
    }: EventResponseMessage<EventResponseType.SYNC_PROJECT_PROGRESS>) => {
      if (payload.isFirstTimeSync) {
        setIsFirstTimeSynced(true)
      }
    },
    [setIsFirstTimeSynced]
  )

  useConsumeMessage(EventResponseType.SYNC_PROJECT_PROGRESS, handleSyncProgress)

  return children
}
