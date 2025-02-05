import { createContext, useState, useContext, useMemo, ReactNode, useCallback } from 'react';
import { EventResponsePayload, EventResponseType, TypedEventResponseMessage } from '../../../shared/protocol';
import { useConsumeMessage } from '../hooks/useConsumeMessage';

export interface GlobalState {
  isInitialized: boolean;
  isLoggedIn: boolean | null;
  config: Record<string, unknown> | null;
  isFigmaAuthenticated: boolean;
}

interface GlobalContextValue extends GlobalState {
  setIsInitialized: (val: boolean) => void;
  setIsLoggedIn: (val: boolean) => void;
  setConfig: (cfg: Record<string, unknown> | null) => void;
  setIsFigmaAuthenticated: (val: boolean) => void;
}

const GlobalContext = createContext<GlobalContextValue | null>(null);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [isFigmaAuthenticated, setIsFigmaAuthenticated] = useState(false);

  const handleConfig = useCallback(
    (payload: EventResponsePayload[EventResponseType.CONFIG]) => {
      setConfig(payload);
    },
    [setConfig]
  );

  const handleInitialized = useCallback(
    (payload: EventResponsePayload[EventResponseType.INITIALIZED]) => {
      const { isFigmaAuthenticated, isInitialized } = payload;

      setIsFigmaAuthenticated(isFigmaAuthenticated);
      setIsInitialized(isInitialized);
    },
    [setIsFigmaAuthenticated, setIsInitialized]
  );

  const handleConnectFigma = useCallback(
    (payload: EventResponsePayload[EventResponseType.FIGMA_OAUTH_CONNECT]) => {
      setIsFigmaAuthenticated(payload);
    },
    [setIsFigmaAuthenticated]
  );

  const handleDisconnectFigma = useCallback(() => {
    setIsFigmaAuthenticated(false);
  }, [setIsFigmaAuthenticated]);

  const handleMessage = useCallback(
    ({ command, payload }: TypedEventResponseMessage) => {
      switch (command) {
        case EventResponseType.CONFIG: {
          handleConfig(payload);
          break;
        }
        case EventResponseType.INITIALIZED: {
          handleInitialized(payload);
          break;
        }
        case EventResponseType.FIGMA_OAUTH_CONNECT: {
          handleConnectFigma(payload);
          break;
        }
        case EventResponseType.FIGMA_OAUTH_DISCONNECT: {
          handleDisconnectFigma();
          break;
        }
      }
    },
    [handleConfig, handleInitialized, handleConnectFigma]
  );

  useConsumeMessage(
    [
      EventResponseType.CONFIG,
      EventResponseType.INITIALIZED,
      EventResponseType.FIGMA_OAUTH_CONNECT,
      EventResponseType.FIGMA_OAUTH_DISCONNECT
    ],
    handleMessage
  );

  const value: GlobalContextValue = useMemo(
    () => ({
      isInitialized,
      isLoggedIn,
      config,
      isFigmaAuthenticated,
      setIsInitialized,
      setIsLoggedIn,
      setConfig,
      setIsFigmaAuthenticated
    }),
    [
      isInitialized,
      isLoggedIn,
      config,
      isFigmaAuthenticated,
      setIsInitialized,
      setIsLoggedIn,
      setConfig,
      setIsFigmaAuthenticated
    ]
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
};

export function useGlobal() {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error('Global context provider not set');
  }

  return context;
}
