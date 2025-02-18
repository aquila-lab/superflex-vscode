import { Button } from '../../../../../common/ui/Button'
import { Spinner } from '../../../../../common/ui/Spinner'
import { useProjectSync } from '../../providers/ProjectSyncProvider'
import { ActionButtons } from '../base/ActionButtons'
import { SettingsCard } from '../base/SettingsCard'
import { SyncProgress } from './SyncProgress'

export const SyncProjectCard = () => {
  const { isSyncing, sync, isProjectSynced } = useProjectSync()

  return (
    <SettingsCard title='Codebase Indexing'>
      <SyncProgress />
      <ActionButtons>
        <Button
          onClick={sync}
          disabled={isSyncing}
        >
          {isProjectSynced && !isSyncing && 'Resync Index'}
          {!isProjectSynced && !isSyncing && 'Sync Project'}
          {isSyncing && <Spinner className='w-4 h-4' />}
        </Button>
      </ActionButtons>
    </SettingsCard>
  )
}
