import { v4 as uuidv4 } from 'uuid';
import { VSCodeWrapper } from './vscodeApi';
import { EventMessage, EventPayloads, EventType, newEventRequest } from '../../../shared/protocol';

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
export async function sendEventWithResponse<T extends EventType>(
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>,
  eventType: T,
  payload?: EventPayloads[T]['request'],
  options: RequestOptions = {}
): Promise<EventPayloads[T]['response']> {
  const messageID = uuidv4();
  let cleanup: () => void = () => {};

  try {
    const promiseResult = new Promise<EventPayloads[T]['response']>((resolve, reject) => {
      const handleResponse = (message: EventMessage<EventType>) => {
        const { id, command, payload, error } = message;

        if (command === eventType && id === messageID) {
          if (error) {
            reject(error);
            return;
          }
          resolve(payload as EventPayloads[T]['response']);
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
      new Promise<EventPayloads[T]['response']>((resolve, reject) =>
        setTimeout(() => reject(new Error(`Request timeout for event ${eventType}`)), options.timeout ?? 5000)
      )
    ]);
  } finally {
    cleanup();
  }
}
