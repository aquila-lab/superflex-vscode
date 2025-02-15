import { Button } from '../../../../../common/ui/Button'
import { useProjectSync } from '../../providers/ProjectSyncProvider'
import { ActionButtons } from '../base/ActionButtons'
import { SettingsCard } from '../base/SettingsCard'
import { SyncProgress } from './SyncProgress'

export const SyncProjectCard = () => {
  const { isSyncing, sync } = useProjectSync()

  return (
    <SettingsCard title='Codebase Indexing'>
      <SyncProgress />
      <ActionButtons>
        <Button
          onClick={sync}
          disabled={isSyncing}
        >
          Resync Index
        </Button>
      </ActionButtons>
    </SettingsCard>
  )
}
