import { createContext, useState, useContext, useMemo, ReactNode, useEffect } from 'react';
import { useVSCode } from './VSCodeContext';
import { EventType } from '../../../shared/protocol';

export interface GlobalState {
  isInitialized: boolean;
  isLoggedIn: boolean;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [isFigmaAuthenticated, setIsFigmaAuthenticated] = useState(false);
  const { postRequest } = useVSCode();

  useEffect(() => {
    postRequest(EventType.READY);
  }, [postRequest]);

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
