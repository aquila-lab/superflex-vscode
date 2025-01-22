import {
  EventRequestMessage,
  EventResponseMessage,
  EventRequestType,
  EventResponseType
} from '../../../shared/protocol';

export type VSCodeApiProps = {
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
};

declare const acquireVsCodeApi: () => VSCodeApi;

interface VSCodeApi {
  getState: () => unknown;
  setState: (newState: unknown) => unknown;
  postMessage: (message: unknown) => void;
}

export type VSCodeWrapper = GenericVSCodeWrapper<
  EventRequestMessage<EventRequestType>,
  EventResponseMessage<EventResponseType>
>;

let api: VSCodeWrapper;

export function getVSCodeAPI(): VSCodeWrapper {
  if (!api) {
    const vsCodeApi = acquireVsCodeApi();
    api = {
      postMessage: (message) => vsCodeApi.postMessage(message),
      onMessage: (callback) => {
        const listener = (event: MessageEvent<EventResponseMessage<EventResponseType>>): void => {
          callback(event.data);
        };
        window.addEventListener('message', listener);
        return () => window.removeEventListener('message', listener);
      },
      setState: (newState) => vsCodeApi.setState(newState),
      getState: () => vsCodeApi.getState()
    };
  }
  return api;
}

export function setVSCodeWrapper(value: VSCodeWrapper): void {
  api = value;
}

export interface GenericVSCodeWrapper<
  W extends EventRequestMessage<EventRequestType>,
  E extends EventResponseMessage<EventResponseType>
> {
  postMessage: (message: W) => void;
  onMessage: (callback: (message: E) => void) => () => void;
  getState: () => unknown;
  setState: (newState: unknown) => void;
}

let genericApi: GenericVSCodeWrapper<any, any>;

export function getGenericVSCodeAPI<
  W extends EventRequestMessage<EventRequestType>,
  E extends EventResponseMessage<EventResponseType>
>(): GenericVSCodeWrapper<W, E> {
  if (!genericApi) {
    const vsCodeApi = acquireVsCodeApi();
    genericApi = {
      postMessage: (message: W) => vsCodeApi.postMessage(message),
      onMessage: (callback) => {
        const listener = (event: MessageEvent<E>): void => {
          callback(event.data);
        };
        window.addEventListener('message', listener);
        return () => window.removeEventListener('message', listener);
      },
      setState: (newState) => vsCodeApi.setState(newState),
      getState: () => vsCodeApi.getState()
    };
  }
  return genericApi;
}
