import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  EventRequestType,
  type EventResponseMessage,
  EventResponseType
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../../../layers/global/hooks/useConsumeMessage'
import { usePostMessage } from '../../../layers/global/hooks/usePostMessage'
import { useGlobal } from '../../../layers/global/providers/GlobalProvider'

const ProjectSyncContext = createContext<{
  isSyncing: boolean
  isProjectSynced: boolean
  progressValue: number
  sync: () => void
} | null>(null)

export const ProjectSyncProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isProjectSynced, setIsProjectSynced] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const { isFirstTimeSynced } = useGlobal()

  useEffect(() => {
    if (isFirstTimeSynced) {
      setIsProjectSynced(true)
    }
  }, [isFirstTimeSynced])

  const handleSyncProgress = useCallback(
    ({
      payload
    }: EventResponseMessage<EventResponseType.SYNC_PROJECT_PROGRESS>) => {
      setProgressValue(payload.progress)

      if (payload.progress === 100) {
        setIsSyncing(false)
        setIsProjectSynced(true)
      }
    },
    []
  )

  useConsumeMessage(EventResponseType.SYNC_PROJECT_PROGRESS, handleSyncProgress)

  const sync = useCallback(() => {
    postMessage(EventRequestType.SYNC_PROJECT)
    setIsSyncing(true)
  }, [postMessage])

  const value = useMemo(
    () => ({
      isSyncing,
      isProjectSynced,
      progressValue,
      sync
    }),
    [isSyncing, isProjectSynced, progressValue, sync]
  )

  return (
    <ProjectSyncContext.Provider value={value}>
      {children}
    </ProjectSyncContext.Provider>
  )
}

export const useProjectSync = () => {
  const context = useContext(ProjectSyncContext)

  if (!context) {
    throw new Error('useProjectSync must be used within ProjectSyncProvider')
  }

  return context
}
