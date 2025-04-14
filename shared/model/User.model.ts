export type User = {
  /** @type {Generics.UUID} */
  id: string
  email: string
  username: string
  picture?: string | null
  stripeCustomerID?: string | null
}

export type Plan = {
  name: string
  basicRequestLimit: number
  premiumRequestLimit: number
  figmaRequestLimit: number
}

export type UserSubscription = {
  plan: Plan | null
  basicRequestsUsed: number
  premiumRequestsUsed: number
  figmaRequestsUsed: number
  lastResetDate: Date
  createdAt: Date
  endDate: Date | null
}

/**
 * Checks if a given subscription is a free plan
 * @param subscription - The user subscription to check
 * @returns boolean indicating if the subscription is a free plan
 */
export const isFreeTierSubscription = (
  subscription: UserSubscription | null
): boolean => {
  return subscription?.plan?.name.toLowerCase().includes('free') ?? false
}
