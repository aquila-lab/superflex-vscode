import { v4 as uuidv4 } from 'uuid';
import React, { useEffect, useRef, useState } from 'react';

import { MessageType, Role } from '../../../shared/model';
import {
  EventMessage,
  EventPayloads,
  EventType,
  FigmaFile,
  FilePayload,
  newEventRequest,
  SendMessagesRequestPayload
} from '../../../shared/protocol';
import { VSCodeWrapper } from '../api/vscodeApi';
import {
  addMessages,
  clearMessages,
  setInitState,
  setIsMessageProcessing,
  setIsProjectSyncing,
  setProjectFiles,
  setSelectedFiles
} from '../core/chat/chatSlice';
import { useAppDispatch, useAppSelector } from '../core/store';
import { ChatInputBox } from '../components/chat/ChatInputBox';
import { ChatMessageList } from '../components/chat/ChatMessageList';
import { ProjectSyncProgress } from '../components/chat/ProjectSyncProgress';
import { FigmaFilePickerModal } from '../components/figma/FigmaFilePickerModal';
import { ChatMessage } from '../core/message/ChatMessage.model';
import { ImagePreview } from '../components/ui/ImagePreview';

const ChatView: React.FunctionComponent<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}> = ({ vscodeAPI }) => {
  const dispatch = useAppDispatch();

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initState = useAppSelector((state) => state.chat.init);
  const isProjectSyncing = useAppSelector((state) => state.chat.isProjectSyncing);
  const isMessageProcessing = useAppSelector((state) => state.chat.isMessageProcessing);

  const [isFirstTimeSync, setIsFirstTimeSync] = useState(false);
  const [projectSyncProgress, setProjectSyncProgress] = useState(0);
  const [isFigmaFileLoading, setIsFigmaFileLoading] = useState(false);
  const [openFigmaFilePickerModal, setOpenFigmaFilePickerModal] = useState(false);
  const [currentOpenFile, setCurrentOpenFile] = useState<FilePayload | null>(null);
  const [chatImageAttachment, setChatImageAttachment] = useState<File>();
  const [chatFigmaAttachment, setChatFigmaAttachment] = useState<FigmaFile>();

  useEffect(() => {
    return vscodeAPI.onMessage((message: EventMessage<EventType>) => {
      const { command, payload, error } = message;

      switch (command) {
        case EventType.INITIALIZED: {
          if (error) {
            dispatch(setInitState({ isInitialized: false }));
            return;
          }

          const initState = payload as EventPayloads[typeof command]['response'];
          dispatch(setInitState(initState));
          break;
        }
        case EventType.SYNC_PROJECT_PROGRESS: {
          const sync = payload as EventPayloads[typeof command]['response'];

          if (sync.progress === 0) {
            if (sync.isFirstTimeSync !== undefined && sync.isFirstTimeSync !== isFirstTimeSync) {
              setIsFirstTimeSync(sync.isFirstTimeSync ?? false);
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
          const isFigmaAuthenticated = payload as EventPayloads[typeof command]['response'];
          dispatch(setInitState({ isFigmaAuthenticated }));
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
            return;
          }

          const figmaFile = payload as EventPayloads[typeof command]['response'];
          setChatFigmaAttachment(figmaFile);
          setIsFigmaFileLoading(false);
          break;
        }
        case EventType.NEW_MESSAGE: {
          dispatch(setIsMessageProcessing(false));

          if (error) {
            console.error(`Error processing 'new_message': ${message.error}`);
            return;
          }

          const newMessage = payload as EventPayloads[typeof command]['response'];
          if (!newMessage) {
            return;
          }

          dispatch(addMessages([newMessage]));
          break;
        }
        case EventType.ADD_MESSAGE: {
          const newMessage = payload as EventPayloads[typeof command]['response'];
          dispatch(addMessages([newMessage]));
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
          const files = payload as EventPayloads[typeof command]['response'];
          dispatch(setProjectFiles(files));
          break;
        }
        case EventType.SET_CURRENT_OPEN_FILE: {
          const file = payload as EventPayloads[typeof command]['request'];
          setCurrentOpenFile(file);
          break;
        }
      }
    });
  }, [vscodeAPI]);

  // If we are here that means we are authenticated and have active subscription or token
  useEffect(() => {
    // Event "initialized" is used to notify the extension that the webview is ready
    vscodeAPI.postMessage(newEventRequest(EventType.INITIALIZED));

    // Clear the previous interval if it exists
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    // Sync user project on every 5 minutes
    syncIntervalRef.current = setInterval(
      () => {
        vscodeAPI.postMessage(newEventRequest(EventType.SYNC_PROJECT));
      },
      5 * 60 * 1000
    );

    // Cleanup function to clear the interval when the component unmounts or before the effect runs again
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [vscodeAPI]);

  function handleSend(
    selectedFiles: FilePayload[],
    textContent: string,
    imageFile?: File,
    figmaFile?: FigmaFile
  ): boolean {
    const messages: ChatMessage[] = [];
    const eventPayload: SendMessagesRequestPayload = { files: selectedFiles, messages: [] };

    // Add image message if present
    if (imageFile) {
      const imageMessage: ChatMessage = {
        id: uuidv4(),
        role: Role.User,
        type: MessageType.Image,
        content: URL.createObjectURL(imageFile)
      };

      messages.push(imageMessage);
      eventPayload.messages.push({
        type: MessageType.Image,
        content: (imageFile as any).path
      });
    }

    // Handle Figma content if present
    if (figmaFile) {
      const figmaMessage: ChatMessage = {
        id: uuidv4(),
        role: Role.User,
        type: MessageType.Figma,
        content: figmaFile.imageUrl
      };

      messages.push({ ...figmaMessage, type: MessageType.Image });
      eventPayload.messages.push(figmaMessage);
    }

    // Add text message if present
    if (textContent.trim()) {
      const textMessage: ChatMessage = {
        id: uuidv4(),
        role: Role.User,
        type: MessageType.Text,
        content: textContent
      };

      messages.push(textMessage);
      eventPayload.messages.push(textMessage);
    }

    // Only proceed if there's at least one message
    if (messages.length > 0) {
      dispatch(addMessages(messages));

      vscodeAPI.postMessage(newEventRequest(EventType.NEW_MESSAGE, eventPayload));
      dispatch(setIsMessageProcessing(true));

      // Clear the attachments
      setChatImageAttachment(undefined);
      setChatFigmaAttachment(undefined);
      dispatch(setSelectedFiles(selectedFiles.filter((f) => f.isCurrentOpenFile)));

      return true;
    }

    return false;
  }

  function handleFigmaButtonClicked(): void {
    if (!initState.isFigmaAuthenticated) {
      vscodeAPI.postMessage(newEventRequest(EventType.FIGMA_OAUTH_CONNECT));
      return;
    }

    setOpenFigmaFilePickerModal(true);
  }

  /**
   *
   * @param figmaSelectionLink Figma selection link. Example: https://www.figma.com/design/GAo9lY4bIk8j2UBUwU33l9/Wireframing-in-Figma?node-id=0-761&t=1QgxKWtCMVPD6cci-4
   */
  function handleFigmaFileSelected(figmaSelectionLink: string): void {
    const figmaFile: FigmaFile = { selectionLink: figmaSelectionLink, imageUrl: '', isLoading: true };

    setIsFigmaFileLoading(true);
    setChatFigmaAttachment(figmaFile);
    setChatImageAttachment(undefined);
    vscodeAPI.postMessage(newEventRequest(EventType.FIGMA_FILE_SELECTED, figmaFile));
  }

  function fetchFiles(): void {
    vscodeAPI.postMessage(newEventRequest(EventType.FETCH_FILES));
  }

  const disableIteractions = isMessageProcessing || isProjectSyncing || !initState.isInitialized;

  const PreviewChatAttachment = (): React.ReactNode => {
    if (!chatImageAttachment && !chatFigmaAttachment) {
      return null;
    }

    let src: string = '';
    let isLoading: boolean = false;
    if (chatImageAttachment) {
      src = URL.createObjectURL(chatImageAttachment);
      isLoading = false;
    }
    if (chatFigmaAttachment) {
      src = chatFigmaAttachment.imageUrl;
      isLoading = chatFigmaAttachment.isLoading;
    }

    return (
      <div className="flex items-center bg-transparent p-2">
        <ImagePreview
          size="sm"
          spinnerSize="sm"
          alt="preview image"
          src={src}
          isLoading={isLoading}
          onRemove={() => {
            setChatImageAttachment(undefined);
            setChatFigmaAttachment(undefined);
          }}
        />
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full p-2">
        <ChatMessageList />
        <ProjectSyncProgress isFirstTimeSync={isFirstTimeSync} progress={projectSyncProgress} />
        <PreviewChatAttachment />
        <ChatInputBox
          disabled={disableIteractions || isFigmaFileLoading}
          currentOpenFile={currentOpenFile}
          fetchFiles={fetchFiles}
          onSendClicked={(selectedFiles, textContent) =>
            handleSend(selectedFiles, textContent, chatImageAttachment, chatFigmaAttachment)
          }
          onImageSelected={(file) => {
            setChatImageAttachment(file);
            setChatFigmaAttachment(undefined);
          }}
          onFigmaButtonClicked={handleFigmaButtonClicked}
        />
      </div>

      <FigmaFilePickerModal
        open={openFigmaFilePickerModal}
        onClose={() => setOpenFigmaFilePickerModal(false)}
        onSubmit={handleFigmaFileSelected}
      />
    </>
  );
};

export default ChatView;
