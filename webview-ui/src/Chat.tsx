import { v4 as uuidv4 } from 'uuid';
import ProgressBar from '@ramonak/react-progress-bar';
import React, { useEffect, useRef, useState } from 'react';

import { VSCodeWrapper } from './api/vscodeApi';
import { newEventMessage } from './api/protocol';
import { InputAndExecuteToolbar, MarkdownRender, FigmaFilePickerModal } from './components';
import { extractFigmaSelectionUrl } from './utils/utils';

type InitState = {
  isInitialized: boolean;
  figmaAuthenticated: boolean;
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  imageUrl?: string;
};

const defaultMessages: Message[] = [
  {
    id: uuidv4(),
    text: "Welcome, I'm your Copilot and I'm here to help you get things done faster.\n\nI'm powered by AI, so surprises and mistakes are possible. Make sure to verify any generated code or suggestions, and share feedback so that we can learn and improve.",
    sender: 'bot'
  }
];

const Chat: React.FunctionComponent<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}> = ({ vscodeAPI }) => {
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [input, setInput] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [streamResponse, setStreamResponse] = useState('');
  const [messageProcessing, setMessageProcessing] = useState(false);
  const [initState, setInitState] = useState<InitState>({ isInitialized: false, figmaAuthenticated: false });
  const [openFigmaFilePickerModal, setOpenFigmaFilePickerModal] = useState(false);

  useEffect(() => {
    return vscodeAPI.onMessage((message) => {
      switch (message.command) {
        case 'initialized':
          setInitState(message.data);
          break;
        case 'figma_oauth_connect':
          setInitState((prev) => ({ ...prev, figmaAuthenticated: message.data }));
          break;
        case 'figma_oauth_disconnect':
          setInitState((prev) => ({ ...prev, figmaAuthenticated: false }));
          break;
        case 'cmd_sync_project':
          vscodeAPI.postMessage(newEventMessage('sync_project'));
          break;
        case 'sync_progress':
          if (message.data.progress === 0) {
            // Sync has started
            setSyncProgress(0);
          }
          setSyncProgress((prev) => (prev < message.data.progress ? message.data.progress : prev));
          break;
        case 'message_processing':
          setStreamResponse((prev) => prev + message.data);
          break;
        // Will be triggered when AI assistant finish processing the message
        case 'new_message':
          setStreamResponse('');
          setMessageProcessing(false);

          if (message.error) {
            console.error(`Error processing 'new_message': ${message.error}`);
            return;
          }
          if (!message.data.length) {
            return;
          }

          for (const msg of message.data) {
            setMessages((prev) => [
              ...prev,
              {
                id: msg.id,
                text: msg.content,
                sender: 'bot'
              }
            ]);
          }
          break;
        // Different from 'new_message', this will be triggered when extension wants to simply add a message to the chat
        case 'add_message':
          setMessages((prev) => [...prev, message.data]);
          break;
        case 'cmd_new_thread':
          setMessages(defaultMessages);
          vscodeAPI.postMessage(newEventMessage('new_thread'));
          break;
      }
    });
  }, [vscodeAPI]);

  // If we are here that means we are authenticated and have active subscription or token
  useEffect(() => {
    // Event "initialized" is used to notify the extension that the webview is ready
    vscodeAPI.postMessage(newEventMessage('initialized'));

    // Clear the previous interval if it exists
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    // Sync user project on every 5 minutes
    syncIntervalRef.current = setInterval(
      () => {
        vscodeAPI.postMessage(newEventMessage('sync_project'));
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

  function handleSend(): void {
    if (input.trim()) {
      setMessages((prev) => [...prev, { id: uuidv4(), text: input, sender: 'user' }]);
      vscodeAPI.postMessage(newEventMessage('new_message', { text: input }));
      setMessageProcessing(true);
    }

    setInput('');
  }

  function handleImageUpload(file: File): void {
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        text: 'Processing image...',
        imageUrl: URL.createObjectURL(file),
        sender: 'bot'
      }
    ]);

    // TODO(boris): Send bytes instead of file path
    vscodeAPI.postMessage(newEventMessage('new_message', { imageUrl: (file as any).path }));
    setMessageProcessing(true);
  }

  async function handleFigmaButtonClicked(): Promise<void> {
    if (!initState.figmaAuthenticated) {
      vscodeAPI.postMessage(newEventMessage('figma_oauth_connect'));
      return;
    }

    setOpenFigmaFilePickerModal(true);
  }

  /**
   *
   * @param figmaSelectionLink Figma selection link. Example: https://www.figma.com/design/GAo9lY4bIk8j2UBUwU33l9/Wireframing-in-Figma?node-id=0-761&t=1QgxKWtCMVPD6cci-4
   */
  async function handleFigmaFileSelected(figmaSelectionLink: string): Promise<boolean> {
    if (!figmaSelectionLink) {
      vscodeAPI.postMessage(
        newEventMessage('error_message', 'Invalid link: Please provide a valid Figma selection link.')
      );
      return false;
    }

    const figmaData = extractFigmaSelectionUrl(figmaSelectionLink);
    if (!figmaData) {
      vscodeAPI.postMessage(
        newEventMessage('error_message', 'Invalid link: Please provide a valid Figma selection link.')
      );
      return false;
    }

    vscodeAPI.postMessage(
      newEventMessage('new_message', {
        figma: {
          fileID: figmaData.fileID,
          nodeID: figmaData.nodeID
        }
      })
    );

    setMessageProcessing(true);

    return true;
  }

  const syncInProgress = syncProgress !== 100;
  const disableIteractions = messageProcessing || syncInProgress || !initState.isInitialized;

  return (
    <>
      <div className="flex flex-col h-full vscode-dark text-white px-3 pb-4">
        <div className="flex-1 flex flex-col justify-start overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`py-4 px-2 border-b border-neutral-700 text-left ${
                message.sender === 'user' ? 'bg-neutral-800' : undefined
              }`}>
              <p className="text-sm font-medium text-neutral-300 mb-2">
                {message.sender === 'user' ? 'You' : 'Superflex'}
              </p>

              <MarkdownRender mdString={message.text} />

              {message.imageUrl && <img alt="preview image" className="mt-2" src={message.imageUrl} />}
            </div>
          ))}

          {streamResponse && (
            <div className={`py-4 px-2 border-b border-neutral-700 text-left`}>
              <p className="text-sm font-medium text-neutral-300 mb-2">Superflex</p>

              <MarkdownRender mdString={streamResponse} />
            </div>
          )}
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

        <InputAndExecuteToolbar
          input={input}
          disabled={disableIteractions}
          onInputChange={(e) => setInput(e.target.value)}
          onFileSelected={handleImageUpload}
          onSendClicked={handleSend}
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
