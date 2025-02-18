import { SettingsHandlersProvider } from './providers/SettingsProvider'
import { ReturnToChatButton } from './components/ReturnToChatButton'
import { UserInfoCard } from './components/user/UserInfoCard'
import { BillingCard } from './components/billing/BillingCard'
import { SyncProjectCard } from './components/sync/SyncProjectCard'
import { ProjectSyncProvider } from './providers/ProjectSyncProvider'

export const SettingsView = () => (
  <ProjectSyncProvider>
    <SettingsHandlersProvider>
      <div className='flex-1 w-full p-6 space-y-8'>
        <ReturnToChatButton />
        <BillingCard />
        <SyncProjectCard />
        <UserInfoCard />
      </div>
    </SettingsHandlersProvider>
  </ProjectSyncProvider>
)
