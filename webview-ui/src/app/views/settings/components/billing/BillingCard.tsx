import { SettingsCard } from '../base/SettingsCard'
import { PlanInfo } from './PlanInfo'
import { SubscriptionStatus } from './SubscriptionStatus'
import { UsageSection } from './UsageSection'

export const BillingCard = () => (
  <SettingsCard title='Billing'>
    <SubscriptionStatus />
    <PlanInfo />
    <UsageSection />
  </SettingsCard>
)
