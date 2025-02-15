import { Badge } from '../../../../../common/ui/Badge'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
export const SubscriptionStatus = () => {
  const { subscription } = useUser()

  if (!subscription.endDate) {
    return null
  }

  return (
    <Badge variant='destructive'>
      Your subscription has been canceled and will end on{' '}
      {subscription.endDate.toLocaleDateString()}.
    </Badge>
  )
}
