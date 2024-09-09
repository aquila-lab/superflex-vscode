import { v4 as uuidv4 } from 'uuid';
import ProgressBar from '@ramonak/react-progress-bar';
import React, { useEffect, useRef, useState } from 'react';

import { MessageType, Role } from '../../../shared/model';
import { EventMessage, EventPayloads, EventType, InitState, newEventRequest } from '../../../shared/protocol';
import { VSCodeWrapper } from '../api/vscodeApi';
import { MarkdownRender } from '../components/ui/MarkdownRender';
import { FigmaFilePickerModal } from '../components/figma/FigmaFilePickerModal';
import { ChatInputBox } from '../components/chat/ChatInputBox';

type ChatMessage = {
  id: string;
  role: Role;
  type: MessageType;
  content: string;
};

const defaultMessages: ChatMessage[] = [
  {
    id: uuidv4(),
    role: Role.Assistant,
    type: MessageType.Text,
    content:
      "Welcome to Superflex! I'm here to help turn your ideas into reality in seconds. Let’s work together and get things done—tell me what you'd like to build today!"
  }
];

const Chat: React.FunctionComponent<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}> = ({ vscodeAPI }) => {
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [input, setInput] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [messageProcessing, setMessageProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [openFigmaFilePickerModal, setOpenFigmaFilePickerModal] = useState(false);
  const [initState, setInitState] = useState<InitState>({ isInitialized: false, figmaAuthenticated: false });

  useEffect(() => {
    return vscodeAPI.onMessage((message: EventMessage<EventType>) => {
      const { command, payload, error } = message;

      switch (command) {
        case EventType.INITIALIZED: {
          const initState = payload as EventPayloads[typeof command]['response'];
          setInitState(initState);
          break;
        }
        case EventType.SYNC_PROJECT_PROGRESS: {
          const { progress } = payload as EventPayloads[typeof command]['response'];
          if (progress === 0) {
            // Sync has started
            setSyncProgress(0);
          }
          setSyncProgress((prev) => (prev < progress ? progress : prev));
          break;
        }
        case EventType.FIGMA_OAUTH_CONNECT: {
          const figmaAuthenticated = payload as EventPayloads[typeof command]['response'];
          setInitState((prev) => ({ ...prev, figmaAuthenticated }));
          break;
        }
        case EventType.FIGMA_OAUTH_DISCONNECT: {
          setInitState((prev) => ({ ...prev, figmaAuthenticated: false }));
          break;
        }
        case EventType.NEW_MESSAGE: {
          setMessageProcessing(false);

          if (error) {
            console.error(`Error processing 'new_message': ${message.error}`);
            return;
          }

          const newMessage = payload as EventPayloads[typeof command]['response'];
          if (!newMessage) {
            return;
          }

          setMessages((prev) => [...prev, newMessage]);
          break;
        }
        case EventType.ADD_MESSAGE: {
          setMessages((prev) => [...prev, payload as EventPayloads[typeof command]['response']]);
          break;
        }
        case EventType.CMD_NEW_THREAD: {
          setMessages(defaultMessages);
          vscodeAPI.postMessage(newEventRequest(EventType.NEW_THREAD));
          break;
        }
        case EventType.CMD_SYNC_PROJECT: {
          vscodeAPI.postMessage(newEventRequest(EventType.SYNC_PROJECT));
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

  function handleTextMessageSend(): void {
    if (input.trim()) {
      const newMessage: ChatMessage = { id: uuidv4(), role: Role.User, type: MessageType.Text, content: input };
      setMessages((prev) => [...prev, newMessage]);

      vscodeAPI.postMessage(newEventRequest(EventType.NEW_MESSAGE, [newMessage]));
      setMessageProcessing(true);
    }

    setInput('');
  }

  function handleImageUpload(file: File): void {
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role: Role.User,
        type: MessageType.Image,
        content: URL.createObjectURL(file)
      },
      {
        id: uuidv4(),
        role: Role.User,
        type: MessageType.Text,
        content: 'Processing image...'
      }
    ]);

    vscodeAPI.postMessage(
      newEventRequest(EventType.NEW_MESSAGE, [
        {
          type: MessageType.Image,
          content: (file as any).path
        }
      ])
    );

    setMessageProcessing(true);
  }

  function handleFigmaButtonClicked(): void {
    if (!initState.figmaAuthenticated) {
      vscodeAPI.postMessage(newEventRequest(EventType.FIGMA_OAUTH_CONNECT));
      return;
    }

    setOpenFigmaFilePickerModal(true);
  }

  /**
   *
   * @param figmaSelectionLink Figma selection link. Example: https://www.figma.com/design/GAo9lY4bIk8j2UBUwU33l9/Wireframing-in-Figma?node-id=0-761&t=1QgxKWtCMVPD6cci-4
   */
  async function handleFigmaFileSelected(figmaSelectionLink: string): Promise<boolean> {
    vscodeAPI.postMessage(
      newEventRequest(EventType.NEW_MESSAGE, [
        {
          type: MessageType.Figma,
          content: figmaSelectionLink
        }
      ])
    );

    setMessageProcessing(true);
    return true;
  }

  const syncInProgress = syncProgress !== 100;
  const disableIteractions = messageProcessing || syncInProgress || !initState.isInitialized;

  return (
    <>
      <div className="flex flex-col h-full p-2">
        <div className="flex-1 flex flex-col justify-start overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`py-4 px-2 border-b border-neutral-700 text-left ${
                message.role === Role.User ? 'bg-neutral-800' : undefined
              }`}>
              <p className="text-sm font-medium text-neutral-300 mb-2">
                {message.role === Role.User ? 'You' : 'Superflex'}
              </p>

              {message.type === MessageType.Text && <MarkdownRender mdString={message.content} />}

              {message.type === MessageType.Image && <img alt="preview image" className="mt-2" src={message.content} />}
            </div>
          ))}
        </div>

        <div className={syncInProgress ? 'flex flex-col items-center gap-1 mb-4 w-full' : 'hidden'}>
          <p className="text-xs text-neutral-300">Syncing...</p>

          <div className="flex-1 w-full">
            <ProgressBar
              animateOnRender={true}
              completed={syncProgress}
              bgColor="#2563eb"
              height="6px"
              isLabelVisible={false}
            />
          </div>
        </div>

        <ChatInputBox
          input={input}
          disabled={disableIteractions}
          onInputChange={(e) => setInput(e.target.value)}
          onFileSelected={handleImageUpload}
          onSendClicked={handleTextMessageSend}
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

export default Chat;
