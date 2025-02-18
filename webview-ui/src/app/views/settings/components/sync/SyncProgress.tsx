import { useMemo } from 'react'
import { Progress } from '../../../../../common/ui/Progress'
import { cn } from '../../../../../common/utils'
import { useProjectSync } from '../../providers/ProjectSyncProvider'

export const SyncProgress = () => {
  const { isSyncing, isProjectSynced, progressValue } = useProjectSync()

  const statusText = useMemo(() => {
    if (isSyncing) {
      return 'Syncing project...'
    }

    if (!isProjectSynced) {
      return 'Project not synced'
    }

    return 'Project synced'
  }, [isSyncing, isProjectSynced])

  return (
    <div className='space-y-4 mb-4 w-full'>
      <p
        className={cn(
          'text-sm',
          isSyncing ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {statusText}
      </p>
      <Progress value={progressValue} />
    </div>
  )
}
