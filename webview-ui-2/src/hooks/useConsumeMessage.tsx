import { useEffect, useCallback } from 'react';
import { EventResponseType, EventResponsePayload, EventResponseMessage } from '../../../shared/protocol';

type MessageHandler<T extends EventResponseType> = (
  payload: EventResponsePayload[T],
  fullEvent: EventResponseMessage<EventResponseType>
) => void;

export function useConsumeMessage<T extends EventResponseType>(
  eventTypes: T | T[],
  onMessage: MessageHandler<T>,
  deps: React.DependencyList = []
): void {
  const handleMessage = useCallback(
    (evt: MessageEvent<EventResponseMessage<EventResponseType>>) => {
      const { command, payload, error } = evt.data || {};
      const typesArray = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

      if (!typesArray.includes(command as T)) return;
      if (error) return;

      onMessage(payload as EventResponsePayload[T], evt.data);
    },
    [eventTypes, onMessage, ...deps]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage as EventListener);
    return () => {
      window.removeEventListener('message', handleMessage as EventListener);
    };
  }, [handleMessage]);
}
