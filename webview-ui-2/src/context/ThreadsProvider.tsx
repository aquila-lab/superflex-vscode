import { ReactNode, useMemo, useContext, createContext, useState, useCallback, useEffect } from 'react';
import { Thread } from '../../../shared/model';
import { EventRequestType, EventResponseType, TypedEventResponseMessage } from '../../../shared/protocol';
import { useConsumeMessage } from '../hooks/useConsumeMessage';
import { usePostMessage } from '../hooks/usePostMessage';

interface ThreadsContextValue {
  threads: Thread[];
  currentThread: Thread | null;
  selectThread: (threadId: string) => void;
  threadKey: number;
}

const ThreadsContext = createContext<ThreadsContextValue | null>(null);

export const ThreadsProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [threadKey, setThreadKey] = useState(0);

  useEffect(() => {
    setThreadKey((prev) => prev + 1);
  }, [currentThread]);

  const selectThread = useCallback((threadId: string) => {
    postMessage(EventRequestType.FETCH_THREAD, {
      threadID: threadId
    });
  }, []);

  const handleThreads = useCallback(({ command, payload }: TypedEventResponseMessage) => {
    switch (command) {
      case EventResponseType.FETCH_THREADS:
        setThreads(payload);
        break;
      case EventResponseType.FETCH_THREAD:
        setCurrentThread(payload);
        break;
      case EventResponseType.NEW_THREAD:
        setCurrentThread(payload);
        break;
    }
  }, []);

  const fetchThreads = useCallback(() => {
    postMessage(EventRequestType.FETCH_THREADS);
  }, [postMessage]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useConsumeMessage(
    [EventResponseType.FETCH_THREADS, EventResponseType.FETCH_THREAD, EventResponseType.NEW_THREAD],
    handleThreads
  );

  const value: ThreadsContextValue = useMemo(
    () => ({ threads, currentThread, threadKey, selectThread }),
    [threads, currentThread, threadKey, selectThread]
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
