import { useEffect } from 'react';
import { EventResponseType, EventResponseMessage } from '../../../shared/protocol';

export function useVSCodeMessage<T extends EventResponseType>(
  eventType: T | T[],
  onMessage: (fullEvent: EventResponseMessage<EventResponseType>) => void
): void {
  useEffect(() => {
    const typesArray = Array.isArray(eventType) ? eventType : [eventType];

    const handleMessage = (evt: MessageEvent<EventResponseMessage<EventResponseType>>) => {
      const { command, error } = evt.data || {};

      if (!typesArray.includes(command as T)) return;
      if (error) {
        return;
      }

      const typedEvent = evt.data as EventResponseMessage<EventResponseType>;
      onMessage(typedEvent);
    };

    window.addEventListener('message', handleMessage as EventListener);
    return () => {
      window.removeEventListener('message', handleMessage as EventListener);
    };
  }, [eventType, onMessage]);
}
