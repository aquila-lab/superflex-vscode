import { useMemo } from 'react'
import { Progress } from '../../../../../common/ui/Progress'
import { Button } from '../../../../../common/ui/Button'
import { cn } from '../../../../../common/utils'
import { useProjectSync } from '../../providers/ProjectSyncProvider'

export const SyncProgress = () => {
  const { isSyncing, isProjectSynced, sync } = useProjectSync()

  const progressValue = useMemo(() => {
    if (!isProjectSynced) {
      return 0
    }
    if (isSyncing) {
      return 50
    }
    return 100
  }, [isSyncing, isProjectSynced])

  const statusText = useMemo(() => {
    if (!isProjectSynced) {
      return 'Project not synced'
    }
    if (isSyncing) {
      return 'Syncing project...'
    }
    return 'Project synced'
  }, [isSyncing, isProjectSynced])

  return (
    <div className='space-y-4 mb-4 w-full'>
      <div className='flex justify-between items-center'>
        <p
          className={cn(
            'text-sm',
            isSyncing ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {statusText}
        </p>
        {!isProjectSynced && (
          <Button
            size='sm'
            onClick={sync}
            disabled={isSyncing}
          >
            Sync
          </Button>
        )}
      </div>
      <Progress value={progressValue} />
    </div>
  )
}
