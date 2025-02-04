import { ReactNode, useMemo, useContext, createContext, useState, useCallback, useEffect } from 'react';
import { Thread } from '../../../shared/model';
import { EventRequestType, EventResponsePayload, EventResponseType } from '../../../shared/protocol';
import { useConsumeMessage } from '../hooks/useConsumeMessage';
import { usePostMessage } from '../hooks/usePostMessage';

interface ThreadsContextValue {
  threads: Thread[];
  currentThread: Thread | null;
  selectThread: (threadId: string) => void;
}

const ThreadsContext = createContext<ThreadsContextValue | null>(null);

export const ThreadsProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage();
  
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);

  const selectThread = useCallback((threadId: string) => {
    postMessage(EventRequestType.FETCH_THREAD, {
      threadID: threadId
    });
  }, []);

  const handleFetchThreads = useCallback((payload: EventResponsePayload[EventResponseType.FETCH_THREADS]) => {
    setThreads(payload);
  }, []);

  const handleFetchThread = useCallback((payload: EventResponsePayload[EventResponseType.FETCH_THREAD]) => {
    setCurrentThread(payload);
  }, []);

  useConsumeMessage(EventResponseType.FETCH_THREADS, handleFetchThreads);
  useConsumeMessage(EventResponseType.FETCH_THREAD, handleFetchThread);

  const fetchThreads = useCallback(() => {
    postMessage(EventRequestType.FETCH_THREADS);
  }, [postMessage]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const value: ThreadsContextValue = useMemo(
    () => ({ threads, currentThread, selectThread }),
    [threads, currentThread, selectThread]
  );

  return <ThreadsContext.Provider value={value}>{children}</ThreadsContext.Provider>;
};

export function useThreads() {
  const context = useContext(ThreadsContext);

  if (!context) {
    throw new Error('Threads context provider not set');
  }

  return context;
}
