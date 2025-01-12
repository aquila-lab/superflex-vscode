import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { useVSCode } from './VSCodeContext';
import { EventType, EventMessage, EventPayloads } from '../../../shared/protocol';
import { User, UserSubscription } from '../../../shared/model/User.model';

interface UserContextValue {
  user: User | null;
  subscription: UserSubscription | null;
  loading: boolean;

  fetchUserInfo: () => void;
  fetchSubscription: () => void;

  handleSubscribe: () => void;
  handleManageBilling: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { postRequest } = useVSCode();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onMessage = (evt: MessageEvent<EventMessage<EventType>>) => {
      const { command, payload, error } = evt.data || {};

      console.log("UserContext: onMessage =>", command, payload, error);

      if (!command) return;
      if (error) {
        return;
      }

      switch (command) {
        case EventType.GET_USER_INFO: {
          const fetchedUser = payload as EventPayloads[EventType.GET_USER_INFO]['response'];
          setUser(fetchedUser);

          setLoading((prev) => (subscription ? false : prev));
          break;
        }
        case EventType.GET_USER_SUBSCRIPTION: {
          const fetchedSub = payload as EventPayloads[EventType.GET_USER_SUBSCRIPTION]['response'];
          setSubscription(fetchedSub);

          setLoading((prev) => (user ? false : prev));
          break;
        }
      }
    };

    window.addEventListener('message', onMessage as EventListener);
    return () => {
      window.removeEventListener('message', onMessage as EventListener);
    };
  }, [user, subscription]);

  useEffect(() => {
    postRequest(EventType.INITIALIZED);
  }, []);

  const fetchUserInfo = useCallback(() => {
    console.log("Posting GET_USER_INFO")
    postRequest(EventType.GET_USER_INFO);
  }, [postRequest]);

  const fetchSubscription = useCallback(() => {
    console.log("Posting GET_USER_SUBSCRIPTION")
    postRequest(EventType.GET_USER_SUBSCRIPTION);
  }, [postRequest]);

  const handleSubscribe = useCallback(() => {
    postRequest(EventType.OPEN_EXTERNAL_URL, { url: 'https://app.superflex.ai/pricing' });
  }, [postRequest]);

  const handleManageBilling = useCallback(() => {
    if (!user) return;
    postRequest(EventType.OPEN_EXTERNAL_URL, {
      url: `https://billing.stripe.com/p/login/3cs3dQdenfJucIU144?prefilled_email=${encodeURIComponent(user.email)}`
    });
  }, [postRequest, user]);

  const value: UserContextValue = useMemo(
    () => ({
      user,
      subscription,
      loading,
      fetchUserInfo,
      fetchSubscription,
      handleSubscribe,
      handleManageBilling
    }),
    [user, subscription, loading, fetchUserInfo, fetchSubscription, handleSubscribe, handleManageBilling]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('UserContext is not provided');
  }

  return context;
}
