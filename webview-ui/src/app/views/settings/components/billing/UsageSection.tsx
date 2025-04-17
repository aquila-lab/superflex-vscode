import { useMemo } from 'react'
import { isFreeTierSubscription } from '../../../../../../../shared/model'
import { CardDescription } from '../../../../../common/ui/Card'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { UsageDisplay } from './UsageDisplay'

export const UsageSection = () => {
  const { subscription } = useUser()

  if (!subscription.plan) {
    return null
  }

  const isFreePlan = useMemo(
    () => isFreeTierSubscription(subscription),
    [subscription]
  )

  return (
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
      {!isFreePlan && (
        <UsageDisplay
          label='Figma Requests'
          used={subscription.figmaRequestsUsed}
          limit={subscription.plan.figmaRequestLimit}
        />
      )}
    </div>
  )
}
