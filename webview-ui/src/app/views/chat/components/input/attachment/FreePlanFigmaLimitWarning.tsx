import { useMemo } from 'react'
import { Alert, AlertDescription } from '../../../../../../common/ui/Alert'
import { useUser } from '../../../../../layers/authenticated/providers/UserProvider'
import { MAX_FREE_NODES } from '../../../../../../../../shared/common/constants'

export const FreePlanFigmaLimitWarning = () => {
  const { subscription } = useUser()

  const isFreePlan = useMemo(
    () => subscription?.plan?.name.toLowerCase().includes('free'),
    [subscription]
  )

  const figmaRequestLimit = useMemo(
    () => subscription?.plan?.figmaRequestLimit || 0,
    [subscription?.plan]
  )

  if (!isFreePlan) {
    return null
  }

  return (
    <Alert variant='warning'>
      <AlertDescription>
        Free plan is limited to {figmaRequestLimit} Figma{' '}
        {figmaRequestLimit === 1 ? 'request' : 'requests'} with max{' '}
        {MAX_FREE_NODES} nodes. Upgrade for unlimited access.
      </AlertDescription>
    </Alert>
  )
}
