import { useMemo } from 'react'
import { Progress } from '../../../../../common/ui/Progress'
import { useProjectSync } from '../../providers/ProjectSyncProvider'

export const SyncProgress = () => {
  const { isSyncing, isProjectSynced, progressValue } = useProjectSync()

  const statusText = useMemo(() => {
    if (isSyncing) {
      return 'Project syncing...'
    }

    if (!isProjectSynced) {
      return 'Project not synced'
    }

    return 'Project synced'
  }, [isSyncing, isProjectSynced])

  return (
    <div className='space-y-4 mb-4 w-full'>
      <p className='text-sm text-muted-foreground'>{statusText}</p>
      <Progress value={progressValue} />
    </div>
  )
}
