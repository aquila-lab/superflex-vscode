import { CardDescription } from '../../../../../common/ui/Card'
import { UsageDisplay } from './UsageDisplay'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'

export const UsageSection = () => {
  const { subscription } = useUser()

  if (!subscription.plan) {
    return null
  }

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
    </div>
  )
}
