import { ReturnToChatButton } from './components/ReturnToChatButton'
import { BillingCard } from './components/billing/BillingCard'
import { EnhanceToggleCard } from './components/enhance/EnhanceToggleCard'
import { FeedbackCard } from './components/feedback/FeedbackCard'
import { SyncProjectCard } from './components/sync/SyncProjectCard'
import { UserInfoCard } from './components/user/UserInfoCard'
import { ProjectSyncProvider } from './providers/ProjectSyncProvider'
import { SettingsHandlersProvider } from './providers/SettingsProvider'

export const SettingsView = () => (
  <ProjectSyncProvider>
    <SettingsHandlersProvider>
      <div className='flex-1 w-full p-6 space-y-6'>
        <ReturnToChatButton />
        <UserInfoCard />
        <EnhanceToggleCard />
        <BillingCard />
        <SyncProjectCard />
        <FeedbackCard />
      </div>
    </SettingsHandlersProvider>
  </ProjectSyncProvider>
)
