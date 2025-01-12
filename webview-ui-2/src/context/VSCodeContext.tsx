import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { EventType, newEventRequest, newEventResponse, EventPayloads, EventMessage } from '../../../shared/protocol';

interface VSCodeContextValue {
  postRequest: <T extends EventType>(command: T, payload?: EventPayloads[T]['request']) => void;
  postResponse: <T extends EventType>(command: T, payload?: EventPayloads[T]['response']) => void;
}

const VSCodeContext = createContext<VSCodeContextValue | null>(null);

export const VSCodeProvider = ({ children }: { children: ReactNode }) => {
  const [vscodeApi, setVscodeApi] = useState<VsCodeApi | null>(null);
  const [pendingTasks, setPendingTasks] = useState<EventMessage[]>([]);

  useEffect(() => {
    if (window?.acquireVsCodeApi) {
      setVscodeApi(window.acquireVsCodeApi());
    }
  }, []);

  useEffect(() => {
    if (vscodeApi) {
      console.log(vscodeApi)
      console.log('sending messages')
      console.log(pendingTasks)
      pendingTasks.forEach((task) => vscodeApi.postMessage(task));
      setPendingTasks([]);
    }
  }, [vscodeApi]);

  const postRequest = useCallback(
    <T extends EventType>(command: T, payload?: EventPayloads[T]['request']) => {
      const message = newEventRequest(command, payload);
      if (!vscodeApi) {
        setPendingTasks((prev) => [...prev, message]);
      } else {
        vscodeApi.postMessage(message);
      }
    },
    [vscodeApi]
  );

  const postResponse = useCallback(
    <T extends EventType>(command: T, payload?: EventPayloads[T]['response']) => {
      const message = newEventResponse(command, payload);
      if (!vscodeApi) {
        setPendingTasks((prev) => [...prev, message]);
      } else {
        vscodeApi.postMessage(message);
      }
    },
    [vscodeApi]
  );

  const value: VSCodeContextValue = useMemo(
    () => ({
      postRequest,
      postResponse
    }),
    [postRequest, postResponse]
  );

  return <VSCodeContext.Provider value={value}>{children}</VSCodeContext.Provider>;
};

export function useVSCode() {
  const context = useContext(VSCodeContext);

  if (!context) {
    throw new Error('VSCode context provider not set');
  }

  return context;
}
