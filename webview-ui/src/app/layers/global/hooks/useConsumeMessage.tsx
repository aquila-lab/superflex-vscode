import { useEffect } from 'react'
import type { EventResponseType } from '../../../../../../shared/protocol'
import { useMessageBus } from '../providers/MessageBusProvider'

export function useConsumeMessage(
  events: EventResponseType | EventResponseType[],
  handler: (payload: any) => void
) {
  const { subscribe } = useMessageBus()

  useEffect(() => {
    const eventArray = Array.isArray(events) ? events : [events]
    const cleanups = eventArray.map(event => subscribe(event, handler))

    return () => cleanups.forEach(cleanup => cleanup())
  }, [events, handler, subscribe])
}
