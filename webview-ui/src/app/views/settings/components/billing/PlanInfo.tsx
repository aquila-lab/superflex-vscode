import { Button } from '../../../../../common/ui/Button'
import { InfoField } from '../base/InfoField'
import { ActionButtons } from '../base/ActionButtons'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { useSettingsHandlers } from '../../providers/SettingsProvider'

export const PlanInfo = () => {
  const { subscription, user } = useUser()
  const { handleManageBilling, handleSubscribe } = useSettingsHandlers()

  const isFreePlan = subscription.plan?.name.toLowerCase().includes('free')
  const hasStripeAccount = Boolean(user.stripeCustomerID)
  const showManageBilling = hasStripeAccount && !isFreePlan
  const planName = subscription.plan?.name

  if (!planName) {
    return null
  }

  return (
    <ActionButtons>
      <InfoField
        label='Current Plan'
        value={planName}
      />
      {showManageBilling ? (
        <Button onClick={handleManageBilling}>Manage Billing</Button>
      ) : (
        <Button onClick={handleSubscribe}>Subscribe</Button>
      )}
    </ActionButtons>
  )
}
