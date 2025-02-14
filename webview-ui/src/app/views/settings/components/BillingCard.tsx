import { useCallback } from 'react'
import { Badge } from '../../../../common/ui/Badge'
import { Button } from '../../../../common/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../../common/ui/Card'
import { useUser } from '../../../layers/authenticated/providers/UserProvider'
import { UsageDisplay } from './UsageDisplay'

export const BillingCard = () => {
  const { user, subscription, manageBilling, subscribe } = useUser()

  if (!subscription.plan) {
    return null
  }

  const isFreePlan = subscription.plan.name.toLowerCase().includes('free')
  const hasStripeAccount = Boolean(user.stripeCustomerID)
  const showManageBilling = hasStripeAccount && !isFreePlan

  const handleManageBilling = useCallback(() => {
    manageBilling()
  }, [manageBilling])

  const handleSubscribe = useCallback(() => {
    subscribe()
  }, [subscribe])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {subscription.endDate && (
          <Badge variant='destructive'>
            Your subscription has been canceled and will end on{' '}
            {new Date(subscription.endDate).toLocaleDateString()}.
          </Badge>
        )}

        <div className='flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center'>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>
              Current Plan
            </p>
            <p className='text-lg font-semibold capitalize'>
              {subscription.plan.name}
            </p>
          </div>

          {showManageBilling ? (
            <Button onClick={handleManageBilling}>Manage Billing</Button>
          ) : (
            <Button onClick={handleSubscribe}>Subscribe</Button>
          )}
        </div>

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
      </CardContent>
    </Card>
  )
}
