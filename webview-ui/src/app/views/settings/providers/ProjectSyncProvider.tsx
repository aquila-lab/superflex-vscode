import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import { usePostMessage } from '../../../layers/global/hooks/usePostMessage'
import { EventRequestType } from '../../../../../../shared/protocol'

const ProjectSyncContext = createContext<{
  isSyncing: boolean
  isProjectSynced: boolean
  sync: () => void
} | null>(null)

export const ProjectSyncProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isProjectSynced, setIsProjectSynced] = useState(true)

  // const handleSync = useCallback(({ command }: TypedEventResponseMessage) => {
  //   switch (command) {
  //     case EventResponseType.PROJECT_SYNC_START:
  //       setIsSyncing(true)
  //       break
  //     case EventResponseType.PROJECT_SYNC_COMPLETE:
  //       setIsSyncing(false)
  //       setIsProjectSynced(true)
  //       break
  //   }
  // }, [])

  // useConsumeMessage(
  //   [
  //     EventResponseType.PROJECT_SYNC_START,
  //     EventResponseType.PROJECT_SYNC_COMPLETE
  //   ],
  //   handleSync
  // )

  const sync = useCallback(() => {
    postMessage(EventRequestType.SYNC_PROJECT)
  }, [postMessage])

  const value = useMemo(
    () => ({
      isSyncing,
      isProjectSynced,
      sync
    }),
    [isSyncing, isProjectSynced, sync]
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
