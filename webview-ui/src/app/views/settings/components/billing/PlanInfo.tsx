import { Button } from '../../../../../common/ui/Button'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { useSettingsHandlers } from '../../providers/SettingsProvider'
import { ActionButtons } from '../base/ActionButtons'
import { InfoField } from '../base/InfoField'
import { isFreeTierSubscription } from '../../../../../../../shared/model'

export const PlanInfo = () => {
  const { subscription, user } = useUser()
  const { handleManageBilling, handleSubscribe } = useSettingsHandlers()

  const isFreePlan = isFreeTierSubscription(subscription)
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
