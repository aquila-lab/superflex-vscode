import { useEffect } from 'react';

import {
  newEventRequest,
  EventRequestType,
  EventResponseType,
  EventResponseMessage,
  EventResponsePayload
} from '../../../shared/protocol';
import { VSCodeWrapper } from '../api/vscodeApi';
import { useAppDispatch } from '../core/store';
import {
  addMessages,
  addSelectedFile,
  resetAllStates,
  setInitState,
  setIsMessageProcessing,
  setIsMessageStreaming,
  setIsProjectSyncing,
  setPreviewVisibleForFileID,
  setProjectFiles,
  updateMessageTextDelta
} from '../core/chat/chatSlice';
import { setUser, setUserSubscription } from '../core/user/userSlice';

interface UseVSCodeEventsProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
  setIsFirstTimeSync: (value: boolean) => void;
  setProjectSyncProgress: (value: number | ((prev: number) => number)) => void;
  setChatFigmaAttachment: (value: any) => void;
  setIsFigmaFileLoading: (value: boolean) => void;
  setCurrentOpenFile: (value: any) => void;
  setIsOutOfRequests: (value: boolean) => void;
  setIsPremiumRequestModalOpen: (value: boolean) => void;
}

export function useVSCodeEvents({
  inputRef,
  vscodeAPI,
  setIsFirstTimeSync,
  setProjectSyncProgress,
  setChatFigmaAttachment,
  setIsFigmaFileLoading,
  setCurrentOpenFile,
  setIsOutOfRequests,
  setIsPremiumRequestModalOpen
}: UseVSCodeEventsProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    return vscodeAPI.onMessage((message: EventResponseMessage<EventResponseType>) => {
      const { command, payload, error } = message;

      switch (command) {
        case EventResponseType.INITIALIZED: {
          if (error) {
            dispatch(setInitState({ isInitialized: false }));
            break;
          }

          dispatch(setInitState(payload as EventResponsePayload[typeof command]));
          break;
        }
        case EventResponseType.GET_USER_INFO: {
          if (error) {
            break;
          }
          dispatch(setUser(payload as EventResponsePayload[typeof command]));
          break;
        }
        case EventResponseType.GET_USER_SUBSCRIPTION: {
          if (error) {
            break;
          }
          dispatch(setUserSubscription(payload as EventResponsePayload[typeof command]));
          break;
        }
        case EventResponseType.SYNC_PROJECT_PROGRESS: {
          const sync = payload as EventResponsePayload[typeof command];

          if (sync.progress === 0) {
            if (sync.isFirstTimeSync !== undefined) {
              setIsFirstTimeSync(sync.isFirstTimeSync);
            }
            dispatch(setIsProjectSyncing(true));
            setProjectSyncProgress(0);
          }
          if (sync.progress === 100) {
            dispatch(setIsProjectSyncing(false));
            setIsFirstTimeSync(false);
          }

          setProjectSyncProgress((prev) => (prev < sync.progress ? sync.progress : prev));
          break;
        }
        case EventResponseType.FIGMA_OAUTH_CONNECT: {
          dispatch(setInitState({ isFigmaAuthenticated: payload as EventResponsePayload[typeof command] }));
          break;
        }
        case EventResponseType.FIGMA_OAUTH_DISCONNECT: {
          dispatch(setInitState({ isFigmaAuthenticated: false }));
          break;
        }
        case EventResponseType.FIGMA_FILE_SELECTED: {
          if (error) {
            setChatFigmaAttachment(undefined);
            setIsFigmaFileLoading(false);
            break;
          }
          setChatFigmaAttachment(payload as EventResponsePayload[typeof command]);
          setIsFigmaFileLoading(false);
          break;
        }
        case EventResponseType.SEND_MESSAGE: {
          dispatch(setIsMessageStreaming(false));
          dispatch(setIsMessageProcessing(false));

          if (error && 'slug' in error && error.slug === 'quota_exceeded') {
            setIsOutOfRequests(true);
            break;
          }
          if (error) {
            console.error(`Error processing 'send_message': ${error.message}`);
            break;
          }

          const newMessage = payload as EventResponsePayload[typeof command];
          if (!newMessage) {
            break;
          }

          dispatch(addMessages([newMessage]));
          break;
        }
        case EventResponseType.MESSAGE_TEXT_DELTA: {
          if (error) {
            dispatch(setIsMessageStreaming(false));
            dispatch(setIsMessageProcessing(false));
            break;
          }
          dispatch(setIsMessageStreaming(true));
          dispatch(updateMessageTextDelta(payload as EventResponsePayload[typeof command]));
          break;
        }
        case EventResponseType.FOCUS_CHAT_INPUT: {
          inputRef.current?.focus();
          break;
        }
        case EventResponseType.CMD_NEW_THREAD: {
          vscodeAPI.postMessage(newEventRequest(EventRequestType.NEW_THREAD));
          break;
        }
        case EventResponseType.NEW_THREAD: {
          dispatch(resetAllStates());
          break;
        }
        case EventResponseType.CMD_SYNC_PROJECT: {
          vscodeAPI.postMessage(newEventRequest(EventRequestType.SYNC_PROJECT));
          break;
        }
        case EventResponseType.FETCH_FILES: {
          dispatch(setProjectFiles(payload as EventResponsePayload[typeof command]));
          break;
        }
        case EventResponseType.SET_CURRENT_OPEN_FILE: {
          setCurrentOpenFile(payload as EventResponsePayload[typeof command]);
          break;
        }
        case EventResponseType.SHOW_SOFT_PAYWALL_MODAL: {
          setIsPremiumRequestModalOpen(true);
          break;
        }
        case EventResponseType.ADD_SELECTED_CODE: {
          const selectedCode = payload as EventResponsePayload[typeof command];
          dispatch(addSelectedFile(selectedCode));
          dispatch(setPreviewVisibleForFileID(selectedCode.id));
          break;
        }
      }
    });
  }, [vscodeAPI]);
}
