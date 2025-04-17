import { useMemo } from 'react'
import { Alert, AlertDescription } from '../../../../../../common/ui/Alert'
import { useUser } from '../../../../../layers/authenticated/providers/UserProvider'
import { isFreeTierSubscription } from '../../../../../../../../shared/model'

export const FreePlanFigmaLimitWarning = () => {
  const { subscription } = useUser()

  const isFreePlan = useMemo(
    () => isFreeTierSubscription(subscription),
    [subscription]
  )

  if (!isFreePlan) {
    return null
  }

  return (
    <Alert variant='warning'>
      <AlertDescription>
        Figma integration is a premium feature. Upgrade to Premium or Team plan
        for access.
      </AlertDescription>
    </Alert>
  )
}
