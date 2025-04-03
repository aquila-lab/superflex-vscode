import { useMemo } from 'react'
import { useUser } from '../../../layers/authenticated/providers/UserProvider'
import { MAX_FREE_NODES } from '../../../../common/utils'

export const useFigmaFreePlanLimits = () => {
  const { subscription } = useUser()

  const isFreePlan = useMemo(
    () => subscription?.plan?.name.toLowerCase().includes('free'),
    [subscription]
  )

  const figmaRequestLimit = useMemo(
    () => subscription?.plan?.figmaRequestLimit || 0,
    [subscription?.plan?.figmaRequestLimit]
  )

  const hasReachedFigmaRequestLimit = useMemo(
    () =>
      isFreePlan && (subscription?.figmaRequestsUsed || 0) >= figmaRequestLimit,
    [isFreePlan, subscription?.figmaRequestsUsed, figmaRequestLimit]
  )

  const figmaLimits = useMemo(
    () => ({
      maxNodes: MAX_FREE_NODES,
      requestsUsed: subscription?.figmaRequestsUsed || 0,
      maxRequests: figmaRequestLimit
    }),
    [subscription?.figmaRequestsUsed, figmaRequestLimit]
  )

  return {
    isFreePlan,
    hasReachedFigmaRequestLimit,
    figmaLimits
  }
}
