import { v4 as uuidv4 } from 'uuid';

import {
  EventRequestPayload,
  EventRequestType,
  EventResponseMessage,
  EventResponsePayload,
  EventResponseType,
  newEventRequest
} from '../../../shared/protocol';
import { VSCodeWrapper } from './vscodeApi';

interface RequestOptions {
  timeout?: number;
}

/**
 * Send an event and wait for a response.
 * @param vscodeAPI - The VSCode API wrapper.
 * @param eventType - The type of event to send.
 * @param payload - The payload to send with the event.
 * @param options - The request options. The default timeout is 5 seconds.
 * @returns A promise that resolves to the response payload.
 */
export async function sendEventWithResponse<T extends EventRequestType, R extends EventResponseType>(
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>,
  eventType: T,
  payload?: EventRequestPayload[T],
  options: RequestOptions = {}
): Promise<EventResponsePayload[R]> {
  const messageID = uuidv4();
  let cleanup: () => void = () => {};

  try {
    const promiseResult = new Promise<EventResponsePayload[R]>((resolve, reject) => {
      const handleResponse = (message: EventResponseMessage<EventResponseType>) => {
        const { id, command, payload, error } = message;

        if (command.toString() === eventType.toString() && id === messageID) {
          if (error) {
            reject(error);
            return;
          }
          resolve(payload as EventResponsePayload[R]);
        }
      };

      cleanup = vscodeAPI.onMessage(handleResponse);
    });

    // Send the request with the message ID
    const messageEvent = newEventRequest(eventType, payload);
    messageEvent.id = messageID;
    vscodeAPI.postMessage(messageEvent);

    return await Promise.race([
      promiseResult,
      new Promise<EventResponsePayload[R]>((resolve, reject) =>
        setTimeout(() => reject(new Error(`Request timeout for event ${eventType}`)), options.timeout ?? 5000)
      )
    ]);
  } finally {
    cleanup();
  }
}
