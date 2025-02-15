import { SettingsHandlersProvider } from './providers/SettingsProvider'
import { ReturnToChatButton } from './components/ReturnToChatButton'
import { UserInfoCard } from './components/user/UserInfoCard'
import { BillingCard } from './components/billing/BillingCard'

export const SettingsView = () => (
  <SettingsHandlersProvider>
    <div className='flex-1 w-full p-6 space-y-8'>
      <ReturnToChatButton />
      <UserInfoCard />
      <BillingCard />
    </div>
  </SettingsHandlersProvider>
)
