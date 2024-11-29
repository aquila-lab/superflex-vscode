import { useEffect, useRef } from 'react';

import { EventType, newEventRequest } from '../../../shared/protocol';
import { VSCodeWrapper } from '../api/vscodeApi';

export function useProjectSync(vscodeAPI: Pick<VSCodeWrapper, 'postMessage'>) {
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    vscodeAPI.postMessage(newEventRequest(EventType.INITIALIZED));

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(
      () => {
        vscodeAPI.postMessage(newEventRequest(EventType.SYNC_PROJECT));
      },
      5 * 60 * 1000
    );

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [vscodeAPI]);
}
