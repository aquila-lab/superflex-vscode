import { useEffect } from "react";
import { EventType, EventMessage } from "../../../shared/protocol";

export function useVSCodeMessage<T extends EventType>(
  eventType: T | T[],
  onMessage: (payload: EventMessage<T>["payload"], fullEvent: EventMessage<T>) => void
): void {
  useEffect(() => {
    const typesArray = Array.isArray(eventType) ? eventType : [eventType];

    const handleMessage = (evt: MessageEvent<EventMessage>) => {
      const { command, error } = evt.data || {};

      if (!typesArray.includes(command as T)) return;
      if (error) {
        return;
      }

      const typedEvent = evt.data as EventMessage<T>;
      onMessage(typedEvent.payload, typedEvent);
    };

    window.addEventListener("message", handleMessage as EventListener);
    return () => {
      window.removeEventListener("message", handleMessage as EventListener);
    };
  }, [eventType, onMessage]);
}
