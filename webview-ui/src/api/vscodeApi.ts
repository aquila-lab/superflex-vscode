import { EventMessage } from '../../../shared/protocol';

export type VSCodeApiProps = {
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
};

declare const acquireVsCodeApi: () => VSCodeApi;

interface VSCodeApi {
  getState: () => unknown;
  setState: (newState: unknown) => unknown;
  postMessage: (message: unknown) => void;
}

export type VSCodeWrapper = GenericVSCodeWrapper<EventMessage, EventMessage>;

let api: VSCodeWrapper;

export function getVSCodeAPI(): VSCodeWrapper {
  if (!api) {
    const vsCodeApi = acquireVsCodeApi();
    api = {
      postMessage: (message) => vsCodeApi.postMessage(message),
      onMessage: (callback) => {
        const listener = (event: MessageEvent<EventMessage>): void => {
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

export interface GenericVSCodeWrapper<W, E> {
  postMessage: (message: W) => void;
  onMessage: (callback: (message: E) => void) => () => void;
  getState: () => unknown;
  setState: (newState: unknown) => void;
}

let genericApi: GenericVSCodeWrapper<any, any>;

export function getGenericVSCodeAPI<W, E>(): GenericVSCodeWrapper<W, E> {
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
