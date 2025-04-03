import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import type { User, UserSubscription } from '../../../../../../shared/model'
import {
  EventRequestType,
  type EventResponsePayload,
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../../global/hooks/useConsumeMessage'
import { usePostMessage } from '../../global/hooks/usePostMessage'
import { useGlobal } from '../../global/providers/GlobalProvider'

const UserContext = createContext<{
  user: User | null
  subscription: UserSubscription | null
  isUserLoading: boolean
  isSubscriptionLoading: boolean
  isOutOfRequests: boolean
  fetchUserInfo: () => void
  fetchSubscription: () => void
  subscribe: (url?: string) => void
  manageBilling: () => void
} | null>(null)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { config } = useGlobal()
  const postMessage = usePostMessage()

  const [user, setUser] = useState<User | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  )

  const [isUserLoading, setIsUserLoading] = useState(true)
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true)

  const isOutOfRequests = useMemo(
    () =>
      Boolean(
        subscription?.plan &&
          subscription.basicRequestsUsed >= subscription.plan.basicRequestLimit
      ),
    [subscription]
  )

  const handleUserInfo = useCallback(
    (payload: EventResponsePayload[EventResponseType.GET_USER_INFO]) => {
      setUser(payload)
      setIsUserLoading(false)
    },
    []
  )

  const handleUserSubscription = useCallback(
    (
      payload: EventResponsePayload[EventResponseType.GET_USER_SUBSCRIPTION]
    ) => {
      setSubscription(payload)
      setIsSubscriptionLoading(false)
    },
    []
  )

  const handleMessage = useCallback(
    ({ command, payload, error }: TypedEventResponseMessage) => {
      // CRITICAL: Proper error handling required!
      // Never remove this check it will break the app.
      if (error) {
        return
      }

      switch (command) {
        case EventResponseType.GET_USER_INFO: {
          handleUserInfo(payload)
          break
        }
        case EventResponseType.GET_USER_SUBSCRIPTION: {
          handleUserSubscription(payload)
          break
        }
      }
    },
    [handleUserInfo, handleUserSubscription]
  )

  const fetchUserInfo = useCallback(() => {
    postMessage(EventRequestType.GET_USER_INFO)
  }, [postMessage])

  const fetchSubscription = useCallback(() => {
    postMessage(EventRequestType.GET_USER_SUBSCRIPTION)
  }, [postMessage])

  const subscribe = useCallback(
    (url?: string) => {
      postMessage(EventRequestType.OPEN_EXTERNAL_URL, {
        url:
          url ??
          `https://app.superflex.ai/dashboard/upgrade-subscription?redirect=true&source=${config?.uriScheme}`
      })
      postMessage(EventRequestType.GET_USER_SUBSCRIPTION)
    },
    [postMessage, config?.uriScheme]
  )

  const manageBilling = useCallback(() => {
    if (!user) {
      return
    }
    postMessage(EventRequestType.OPEN_EXTERNAL_URL, {
      url: `https://billing.stripe.com/p/login/3cs3dQdenfJucIU144?prefilled_email=${encodeURIComponent(user.email)}`
    })
  }, [postMessage, user])

  useEffect(() => {
    postMessage(EventRequestType.INITIALIZED)
    fetchUserInfo()
    fetchSubscription()
  }, [postMessage, fetchUserInfo, fetchSubscription])

  useConsumeMessage(
    [EventResponseType.GET_USER_INFO, EventResponseType.GET_USER_SUBSCRIPTION],
    handleMessage
  )

  const value = useMemo(
    () => ({
      user,
      subscription,
      isUserLoading,
      isSubscriptionLoading,
      isOutOfRequests,
      fetchUserInfo,
      fetchSubscription,
      subscribe,
      manageBilling
    }),
    [
      user,
      subscription,
      isUserLoading,
      isSubscriptionLoading,
      isOutOfRequests,
      fetchUserInfo,
      fetchSubscription,
      subscribe,
      manageBilling
    ]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('UserContext is not provided')
  }

  const ensureUser = useMemo(() => {
    if (!(context.isUserLoading || context.user)) {
      throw new Error('User is required but not found')
    }
    return context.user as User
  }, [context.isUserLoading, context.user])

  const ensureSubscription = useMemo(() => {
    if (!(context.isSubscriptionLoading || context.subscription)) {
      throw new Error('Subscription is required but not found')
    }
    return context.subscription as UserSubscription
  }, [context.isSubscriptionLoading, context.subscription])

  return {
    ...context,
    user: ensureUser,
    subscription: ensureSubscription
  }
}
