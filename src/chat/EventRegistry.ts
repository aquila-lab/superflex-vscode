import { EventMessage } from "../protocol";

type Handler<RequestPayload = unknown, ResponsePayload = unknown> = (
  payload: RequestPayload,
  sendEventMessageCb: (msg: EventMessage) => void
) => Promise<ResponsePayload> | ResponsePayload;

export class EventRegistry {
  private events: { [key: string]: Handler<any, any> };

  constructor() {
    this.events = {};
  }

  registerEvent<Req, Res>(event: string, handler: Handler<Req, Res>) {
    this.events[event] = handler;
    return this;
  }

  async handleEvent<Req, Res>(
    event: string,
    requestPayload: Req,
    sendEventMessageCb: (msg: EventMessage) => void
  ): Promise<Res> {
    const handler = this.events[event] as Handler<Req, Res>;
    if (handler) {
      return handler(requestPayload, sendEventMessageCb);
    }
    throw new Error(`Event: ${event} does not exist in the registry`);
  }
}
