import { v4 as uuidv4 } from 'uuid';
import React, { useCallback, useRef, useState } from 'react';

import {
  FigmaContent,
  Message,
  MessageContent,
  MessageType,
  Role,
  TextContent,
  extractFigmaSelectionUrl
} from '../../../shared/model';
import {
  EventRequestType,
  EventResponseType,
  FigmaFile,
  FilePayload,
  newEventRequest,
  SendMessagesRequestPayload
} from '../../../shared/protocol';
import { VSCodeWrapper } from '../api/vscodeApi';
import { sendEventWithResponse } from '../api/eventUtils';
import {
  addMessages,
  addSelectedFile,
  setIsMessageProcessing,
  setPreviewVisibleForFileID,
  setSelectedFiles
} from '../core/chat/chatSlice';
import { useAppDispatch, useAppSelector } from '../core/store';
import { OutOfRequestsPage, SoftLimitModal } from '../components/billing';
import { ChatInputBox } from '../components/chat/ChatInputBox';
import { ChatMessageList } from '../components/chat/ChatMessageList';
import { ProjectSyncProgress } from '../components/chat/ProjectSyncProgress';
import { FigmaFilePickerModal } from '../components/figma/FigmaFilePickerModal';
import { readImageFileAsBase64 } from '../common/utils';
import ChatViewAttachment from '../components/chat/ChatViewAttachment';
import { useVSCodeEvents } from '../hooks/useVSCodeEvents';
import { useProjectSync } from '../hooks/useProjectSync';

const ChatView = React.memo<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}>(({ vscodeAPI }) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const initState = useAppSelector((state) => state.chat.init);
  const userSubscription = useAppSelector((state) => state.user.subscription);
  const isProjectSyncing = useAppSelector((state) => state.chat.isProjectSyncing);
  const isMessageProcessing = useAppSelector((state) => state.chat.isMessageProcessing);

  const [isFirstTimeSync, setIsFirstTimeSync] = useState(false);
  const [projectSyncProgress, setProjectSyncProgress] = useState(0);
  const [isFigmaFileLoading, setIsFigmaFileLoading] = useState(false);
  const [isFigmaFilePickerModalOpen, setIsFigmaFilePickerModalOpen] = useState(false);
  const [currentOpenFile, setCurrentOpenFile] = useState<FilePayload | null>(null);
  const [chatImageAttachment, setChatImageAttachment] = useState<File>();
  const [chatFigmaAttachment, setChatFigmaAttachment] = useState<FigmaFile>();
  const [isOutOfRequests, setIsOutOfRequests] = useState(false);
  const [isPremiumRequestModalOpen, setIsPremiumRequestModalOpen] = useState(false);

  useVSCodeEvents({
    inputRef,
    vscodeAPI,
    setIsFirstTimeSync,
    setProjectSyncProgress,
    setChatFigmaAttachment,
    setIsFigmaFileLoading,
    setCurrentOpenFile,
    setIsOutOfRequests,
    setIsPremiumRequestModalOpen
  });

  useProjectSync(vscodeAPI);

  const handleSend = useCallback(
    async (
      selectedFiles: FilePayload[],
      textContent: string,
      imageFile?: File,
      figmaFile?: FigmaFile
    ): Promise<boolean> => {
      const messages: MessageContent[] = [];
      const eventPayload: SendMessagesRequestPayload = { files: selectedFiles, messages: [] };

      if (imageFile) {
        const imageBase64 = await readImageFileAsBase64(imageFile);
        messages.push({ type: MessageType.Image, image: URL.createObjectURL(imageFile) });
        eventPayload.messages.push({ type: MessageType.Image, image: imageBase64 });
      }

      if (figmaFile) {
        const figmaSelection = extractFigmaSelectionUrl(figmaFile.selectionLink);
        if (!figmaSelection) {
          vscodeAPI.postMessage(
            newEventRequest(EventRequestType.SEND_NOTIFICATION, {
              message: 'Invalid Figma selection link. Please provide a valid Figma selection url.'
            })
          );
          return false;
        }

        const figmaMessage: FigmaContent = {
          type: MessageType.Figma,
          fileID: figmaSelection.fileID,
          nodeID: figmaSelection.nodeID,
          image: figmaFile.imageUrl
        };

        messages.push(figmaMessage);
        eventPayload.messages.push(figmaMessage);
      }

      if (textContent.trim()) {
        const textMessage: TextContent = { type: MessageType.Text, text: textContent };
        messages.push(textMessage);
        eventPayload.messages.push(textMessage);
      }

      if (messages.length > 0) {
        dispatch(
          addMessages(
            messages.map((m) => ({
              id: uuidv4(),
              threadID: uuidv4(),
              role: Role.User,
              content: m,
              updatedAt: new Date(),
              createdAt: new Date()
            }))
          )
        );

        vscodeAPI.postMessage(newEventRequest(EventRequestType.SEND_MESSAGE, eventPayload));
        dispatch(setIsMessageProcessing(true));

        setChatImageAttachment(undefined);
        setChatFigmaAttachment(undefined);
        dispatch(setSelectedFiles(selectedFiles.filter((f) => f.isCurrentOpenFile)));

        return true;
      }

      return false;
    },
    [vscodeAPI, dispatch]
  );

  const handleFigmaButtonClicked = useCallback(() => {
    if (!initState.isFigmaAuthenticated) {
      vscodeAPI.postMessage(newEventRequest(EventRequestType.FIGMA_OAUTH_CONNECT));
      return;
    }

    setIsFigmaFilePickerModalOpen(true);
  }, [initState.isFigmaAuthenticated, userSubscription?.plan, vscodeAPI]);

  const handleFigmaFileSelected = useCallback(
    (figmaSelectionLink: string) => {
      const figmaFile: FigmaFile = { selectionLink: figmaSelectionLink, imageUrl: '', isLoading: true };
      setIsFigmaFileLoading(true);
      setChatFigmaAttachment(figmaFile);
      setChatImageAttachment(undefined);

      vscodeAPI.postMessage(newEventRequest(EventRequestType.FIGMA_FILE_SELECTED, figmaFile));

      inputRef.current?.focus();
    },
    [vscodeAPI]
  );

  const handleMessageFeedback = useCallback(
    (message: Message, feedback: string) => {
      vscodeAPI.postMessage(newEventRequest(EventRequestType.UPDATE_MESSAGE, { ...message, feedback }));
    },
    [vscodeAPI]
  );

  const handleSubscribe = useCallback(
    (openLink?: string) => {
      if (!openLink) {
        openLink = 'https://app.superflex.ai/pricing';
      }

      vscodeAPI.postMessage(newEventRequest(EventRequestType.OPEN_EXTERNAL_URL, { url: openLink }));
    },
    [vscodeAPI]
  );

  const handlePaste = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        const selectedCode = await sendEventWithResponse<
          EventRequestType.PASTE_COPIED_CODE,
          EventResponseType.PASTE_COPIED_CODE
        >(vscodeAPI, EventRequestType.PASTE_COPIED_CODE, { text });
        if (!selectedCode) return false;

        dispatch(addSelectedFile(selectedCode));
        dispatch(setPreviewVisibleForFileID(selectedCode.id));
        return true;
      } catch (err) {
        return false;
      }
    },
    [vscodeAPI, dispatch]
  );

  const handleFileNameClick = useCallback(
    (filePath: string) => {
      vscodeAPI.postMessage(newEventRequest(EventRequestType.OPEN_FILE, { filePath }));
    },
    [vscodeAPI]
  );

  const handleFastApplyClick = useCallback(
    async (filePath: string, edits: string) => {
      await sendEventWithResponse<EventRequestType.FAST_APPLY, EventResponseType.FAST_APPLY>(
        vscodeAPI,
        EventRequestType.FAST_APPLY,
        { filePath, edits },
        { timeout: 60000 }
      );
    },
    [vscodeAPI]
  );

  const handleAcceptAllChanges = useCallback(
    (filePath: string) => {
      vscodeAPI.postMessage(newEventRequest(EventRequestType.FAST_APPLY_ACCEPT, { filePath }));
    },
    [vscodeAPI]
  );

  const handleRejectAllChanges = useCallback(
    (filePath: string) => {
      vscodeAPI.postMessage(newEventRequest(EventRequestType.FAST_APPLY_REJECT, { filePath }));
    },
    [vscodeAPI]
  );

  const fetchFiles = useCallback(() => {
    vscodeAPI.postMessage(newEventRequest(EventRequestType.FETCH_FILES));
  }, [vscodeAPI]);

  const fetchFileContent = useCallback(
    async (file: FilePayload): Promise<string> => {
      try {
        const content = await sendEventWithResponse<
          EventRequestType.FETCH_FILE_CONTENT,
          EventResponseType.FETCH_FILE_CONTENT
        >(vscodeAPI, EventRequestType.FETCH_FILE_CONTENT, file);
        return content ?? '';
      } catch (err) {
        return '';
      }
    },
    [vscodeAPI]
  );

  const disableInteractions = isMessageProcessing || isProjectSyncing || !initState.isInitialized;

  if (
    isOutOfRequests ||
    (userSubscription?.plan && userSubscription.basicRequestsUsed >= userSubscription.plan.basicRequestLimit)
  ) {
    return (
      <div className="flex flex-col h-full p-2 pt-0">
        <OutOfRequestsPage onSubscribe={handleSubscribe} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full p-2 pt-0">
        <ChatMessageList
          handleMessageFeedback={handleMessageFeedback}
          onFileNameClick={handleFileNameClick}
          onFastApplyClick={handleFastApplyClick}
          onAcceptAllChanges={handleAcceptAllChanges}
          onRejectAllChanges={handleRejectAllChanges}
        />
        <ProjectSyncProgress isFirstTimeSync={isFirstTimeSync} progress={projectSyncProgress} />
        <ChatViewAttachment
          chatImageAttachment={chatImageAttachment}
          chatFigmaAttachment={chatFigmaAttachment}
          onRemoveAttachment={() => {
            setChatImageAttachment(undefined);
            setChatFigmaAttachment(undefined);
          }}
        />
        <ChatInputBox
          inputRef={inputRef}
          disabled={disableInteractions || isFigmaFileLoading}
          currentOpenFile={currentOpenFile}
          onPaste={handlePaste}
          fetchFiles={fetchFiles}
          fetchFileContent={fetchFileContent}
          onSendClicked={async (selectedFiles, textContent) =>
            handleSend(selectedFiles, textContent, chatImageAttachment, chatFigmaAttachment)
          }
          onImageSelected={(file) => {
            setChatImageAttachment(file);
            setChatFigmaAttachment(undefined);
            inputRef.current?.focus();
          }}
          onFigmaButtonClicked={handleFigmaButtonClicked}
          onSubscribe={handleSubscribe}
        />
      </div>

      <FigmaFilePickerModal
        open={isFigmaFilePickerModalOpen}
        onClose={() => setIsFigmaFilePickerModalOpen(false)}
        onSubmit={handleFigmaFileSelected}
      />
      <SoftLimitModal
        isOpen={isPremiumRequestModalOpen}
        onClose={() => setIsPremiumRequestModalOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </>
  );
});

ChatView.displayName = 'ChatView';

export default ChatView;
