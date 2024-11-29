import { useEffect } from 'react';

import { EventMessage, EventType, EventPayloads, newEventRequest } from '../../../shared/protocol';
import { VSCodeWrapper } from '../api/vscodeApi';
import { useAppDispatch } from '../core/store';
import {
  addMessages,
  addSelectedFile,
  clearMessages,
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
    return vscodeAPI.onMessage((message: EventMessage<EventType>) => {
      const { command, payload, error } = message;

      switch (command) {
        case EventType.INITIALIZED: {
          if (error) {
            dispatch(setInitState({ isInitialized: false }));
            break;
          }
          dispatch(setInitState(payload as EventPayloads[typeof command]['response']));
          break;
        }
        case EventType.GET_USER_INFO: {
          if (error) {
            break;
          }
          dispatch(setUser(payload as EventPayloads[typeof command]['response']));
          break;
        }
        case EventType.GET_USER_SUBSCRIPTION: {
          if (error) {
            break;
          }
          dispatch(setUserSubscription(payload as EventPayloads[typeof command]['response']));
          break;
        }
        case EventType.SYNC_PROJECT_PROGRESS: {
          const sync = payload as EventPayloads[typeof command]['response'];

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
        case EventType.FIGMA_OAUTH_CONNECT: {
          dispatch(setInitState({ isFigmaAuthenticated: payload as EventPayloads[typeof command]['response'] }));
          break;
        }
        case EventType.FIGMA_OAUTH_DISCONNECT: {
          dispatch(setInitState({ isFigmaAuthenticated: false }));
          break;
        }
        case EventType.FIGMA_FILE_SELECTED: {
          if (error) {
            setChatFigmaAttachment(undefined);
            setIsFigmaFileLoading(false);
            break;
          }
          setChatFigmaAttachment(payload as EventPayloads[typeof command]['response']);
          setIsFigmaFileLoading(false);
          break;
        }
        case EventType.NEW_MESSAGE: {
          dispatch(setIsMessageStreaming(false));
          dispatch(setIsMessageProcessing(false));

          if (error && 'slug' in error && error.slug === 'quota_exceeded') {
            setIsOutOfRequests(true);
            break;
          }
          if (error) {
            console.error(`Error processing 'new_message': ${error.message}`);
            break;
          }

          const newMessage = payload as EventPayloads[typeof command]['response'];
          if (!newMessage) {
            break;
          }

          dispatch(addMessages([newMessage]));
          break;
        }
        case EventType.MESSAGE_TEXT_DELTA: {
          if (error) {
            dispatch(setIsMessageStreaming(false));
            dispatch(setIsMessageProcessing(false));
            break;
          }
          dispatch(setIsMessageStreaming(true));
          dispatch(updateMessageTextDelta(payload as EventPayloads[typeof command]['response']));
          break;
        }
        case EventType.FOCUS_CHAT_INPUT: {
          inputRef.current?.focus();
          break;
        }
        case EventType.CMD_NEW_THREAD: {
          dispatch(clearMessages());
          vscodeAPI.postMessage(newEventRequest(EventType.NEW_THREAD));
          break;
        }
        case EventType.CMD_SYNC_PROJECT: {
          vscodeAPI.postMessage(newEventRequest(EventType.SYNC_PROJECT));
          break;
        }
        case EventType.FETCH_FILES: {
          dispatch(setProjectFiles(payload as EventPayloads[typeof command]['response']));
          break;
        }
        case EventType.SET_CURRENT_OPEN_FILE: {
          setCurrentOpenFile(payload as EventPayloads[typeof command]['request']);
          break;
        }
        case EventType.SHOW_SOFT_PAYWALL_MODAL: {
          setIsPremiumRequestModalOpen(true);
          break;
        }
        case EventType.ADD_SELECTED_CODE: {
          const selectedCode = payload as EventPayloads[typeof command]['request'];
          dispatch(addSelectedFile(selectedCode));
          dispatch(setPreviewVisibleForFileID(selectedCode.id));
          break;
        }
      }
    });
  }, [vscodeAPI]);
}
