import type {
  EventRequestPayload,
  EventRequestType,
  EventResponseMessage,
  EventResponsePayload,
  EventResponseType
} from '../../shared/protocol'

export type Handler<T extends EventRequestType, R extends EventResponseType> = (
  payload: EventRequestPayload[T],
  sendEventMessageCb: (msg: EventResponseMessage<R>) => void
) => Promise<EventResponsePayload[R]> | EventResponsePayload[R]

export class EventRegistry {
  private events: {
    [key: string]: Handler<EventRequestType, EventResponseType>
  }

  constructor() {
    this.events = {}
  }

  registerEvent<T extends EventRequestType, R extends EventResponseType>(
    event: T,
    handler: Handler<T, R>
  ) {
    this.events[event] = handler
    return this
  }

  async handleEvent<T extends EventRequestType, R extends EventResponseType>(
    event: T,
    requestPayload: EventRequestPayload[T],
    sendEventMessageCb: (msg: EventResponseMessage<R>) => void
  ): Promise<EventResponsePayload[R]> {
    const handler = this.events[event] as Handler<T, R>
    if (handler) {
      return handler(requestPayload, sendEventMessageCb)
    }
    throw new Error(`Event: ${event} does not exist in the registry`)
  }
}
