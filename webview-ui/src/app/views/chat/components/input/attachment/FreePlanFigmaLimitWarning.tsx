import { useMemo } from 'react'
import { Alert, AlertDescription } from '../../../../../../common/ui/Alert'
import { useUser } from '../../../../../layers/authenticated/providers/UserProvider'
import { MAX_FREE_NODES } from '../../../../../../common/utils'

export const FreePlanFigmaLimitWarning = () => {
  const { subscription } = useUser()

  const isFreePlan = useMemo(
    () => subscription?.plan?.name.toLowerCase().includes('free'),
    [subscription]
  )

  if (!isFreePlan) {
    return null
  }

  return (
    <Alert
      variant='warning'
      className='mb-4'
    >
      <AlertDescription>
        Free plan is limited to 1 Figma request with max {MAX_FREE_NODES} nodes.
        Upgrade for unlimited access.
      </AlertDescription>
    </Alert>
  )
}
