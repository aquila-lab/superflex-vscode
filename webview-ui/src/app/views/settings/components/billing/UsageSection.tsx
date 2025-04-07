import { CardDescription } from '../../../../../common/ui/Card'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { UsageDisplay } from './UsageDisplay'

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
      <UsageDisplay
        label='Figma Requests'
        used={subscription.figmaRequestsUsed}
        limit={subscription.plan.figmaRequestLimit}
      />
    </div>
  )
}
