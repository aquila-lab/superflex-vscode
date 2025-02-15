import { Badge } from '../../../../../common/ui/Badge'
import { Button } from '../../../../../common/ui/Button'
import { CardDescription } from '../../../../../common/ui/Card'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { ActionButtons } from '../base/ActionButtons'
import { InfoField } from '../base/InfoField'
import { SettingsCard } from '../base/SettingsCard'
import { UsageDisplay } from './UsageDisplay'
import { useSettingsHandlers } from '../../providers/SettingsProvider'

export const BillingCard = () => {
  const { user, subscription } = useUser()
  const { handleManageBilling, handleSubscribe } = useSettingsHandlers()
  if (!subscription.plan) {
    return null
  }

  const isFreePlan = subscription.plan.name.toLowerCase().includes('free')
  const hasStripeAccount = Boolean(user.stripeCustomerID)
  const showManageBilling = hasStripeAccount && !isFreePlan

  return (
    <SettingsCard title='Billing'>
      {subscription.endDate && (
        <Badge variant='destructive'>
          Your subscription has been canceled and will end on{' '}
          {new Date(subscription.endDate).toLocaleDateString()}.
        </Badge>
      )}

      <ActionButtons>
        <InfoField
          label='Current Plan'
          value={subscription.plan.name}
        />
        {showManageBilling ? (
          <Button onClick={handleManageBilling}>Manage Billing</Button>
        ) : (
          <Button onClick={handleSubscribe}>Subscribe</Button>
        )}
      </ActionButtons>

      <div className='space-y-4'>
        <CardDescription>Usage</CardDescription>
        <UsageDisplay
          label='Premium Requests'
          used={subscription.premiumRequestsUsed}
          limit={subscription.plan.premiumRequestLimit}
        />
        <UsageDisplay
          label='Basic Requests'
          used={subscription.basicRequestsUsed}
          limit={subscription.plan.basicRequestLimit}
        />
      </div>
    </SettingsCard>
  )
}
