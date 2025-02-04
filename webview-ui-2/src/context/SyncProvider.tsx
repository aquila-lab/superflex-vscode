import { ReactNode, useMemo, useContext, createContext, useState, useCallback } from 'react';
import { EventRequestType, EventResponsePayload, EventResponseType } from '../../../shared/protocol';
import { useConsumeMessage } from '../hooks/useConsumeMessage';
import { usePostMessage } from '../hooks/usePostMessage';

interface SyncContextValue {
  isSyncing: boolean;
  syncProgress: number;
  isFirstTimeSync: boolean;
  syncProject: () => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isFirstTimeSync, setIsFirstTimeSync] = useState(false);

  const handleProjectProgress = useCallback(
    (payload: EventResponsePayload[EventResponseType.SYNC_PROJECT_PROGRESS]) => {
      const { isFirstTimeSync: firstTime, progress } = payload;

      if (progress === 0) {
        setIsSyncing(true);
        setSyncProgress(0);

        if (firstTime) {
          setIsFirstTimeSync(firstTime);
        }
      } else if (progress === 100) {
        setIsSyncing(false);
        setIsFirstTimeSync(false);
      }

      setSyncProgress((prev) => (prev < progress ? progress : prev));
    },
    []
  );

  useConsumeMessage(EventResponseType.SYNC_PROJECT_PROGRESS, handleProjectProgress);

  const syncProject = useCallback(() => {
    postMessage(EventRequestType.SYNC_PROJECT);
  }, [postMessage]);

  const value: SyncContextValue = useMemo(
    () => ({ isSyncing, syncProgress, isFirstTimeSync, syncProject }),
    [isSyncing, syncProgress, isFirstTimeSync, syncProject]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export function useSync() {
  const context = useContext(SyncContext);

  if (!context) {
    throw new Error('Sync context provider not set');
  }

  return context;
}
