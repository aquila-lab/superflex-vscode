import { useMemo } from 'react'
import { useUser } from '../../../layers/authenticated/providers/UserProvider'
import { MAX_FREE_NODES } from '../../../../../../shared/common/constants'
import { isFreeTierSubscription } from '../../../../../../shared/model'

export const useFigmaFreePlanLimits = () => {
  const { subscription } = useUser()

  const isFreePlan = useMemo(
    () => isFreeTierSubscription(subscription),
    [subscription, subscription.plan, subscription.plan?.name]
  )

  const figmaRequestLimit = useMemo(
    () => subscription?.plan?.figmaRequestLimit || 0,
    [subscription?.plan?.figmaRequestLimit, subscription?.plan, subscription]
  )

  const hasReachedFigmaRequestLimit = useMemo(() => isFreePlan, [isFreePlan])

  const figmaLimits = useMemo(
    () => ({
      maxNodes: MAX_FREE_NODES,
      requestsUsed: subscription?.figmaRequestsUsed || 0,
      maxRequests: figmaRequestLimit
    }),
    [subscription, subscription?.figmaRequestsUsed, figmaRequestLimit]
  )

  return useMemo(
    () => ({
      isFreePlan,
      hasReachedFigmaRequestLimit,
      figmaLimits
    }),
    [isFreePlan, hasReachedFigmaRequestLimit, figmaLimits]
  )
}
