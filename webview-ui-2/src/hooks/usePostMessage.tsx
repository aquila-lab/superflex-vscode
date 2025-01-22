import { useCallback } from 'react';
import {
  EventRequestType,
  EventRequestPayload,
  EventResponsePayload,
  EventRequestToResponseTypeMap
} from '../../../shared/protocol';
import { useVSCode } from '../context/VSCodeContext';

type PostMessageOptions<T extends EventRequestType> = {
  onSuccess?: (payload: EventResponsePayload[(typeof EventRequestToResponseTypeMap)[T]]) => void;
  onError?: (error: Error) => void;
};

export function usePostMessage() {
  const { postMessage } = useVSCode();

  return useCallback(
    <T extends EventRequestType>(command: T, payload?: EventRequestPayload[T], options?: PostMessageOptions<T>) => {
      const { onSuccess, onError } = options ?? {};

      if (onSuccess ?? onError) {
        const responseType = EventRequestToResponseTypeMap[command];

        if (responseType) {
          const handleResponse = (event: MessageEvent) => {
            const { command: responseCommand, payload: responsePayload, error } = event.data || {};

            if (responseCommand === responseType) {
              window.removeEventListener('message', handleResponse);

              if (error) {
                onError?.(error);
              } else {
                onSuccess?.(responsePayload);
              }
            }
          };

          window.addEventListener('message', handleResponse);
        }
      }

      postMessage(command, payload);
    },
    [postMessage]
  );
}
