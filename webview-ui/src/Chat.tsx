import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ProgressBar from '@ramonak/react-progress-bar';
import TextareaAutosize from 'react-textarea-autosize';

import { VSCodeWrapper } from './api/vscodeApi';
import { newEventMessage } from './api/protocol';
import { Button, FilePicker, MarkdownRender } from './components';

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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    return vscodeAPI.onMessage((message) => {
      switch (message.command) {
        case 'initialized':
          setInitialized(message.data);
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
        case 'new_message': // Will be triggered when AI assistant finish processing the message
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
    syncIntervalRef.current = setInterval(() => {
      vscodeAPI.postMessage(newEventMessage('sync_project'));
    }, 5 * 60 * 1000);

    // Cleanup function to clear the interval when the component unmounts or before the effect runs again
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [vscodeAPI]);

  const handleSend = (): void => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { id: uuidv4(), text: input, sender: 'user' }]);
      vscodeAPI.postMessage(newEventMessage('new_message', { text: input }));
      setMessageProcessing(true);
    }

    setInput('');
  };

  const handleImageUpload = (file: File): void => {
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        text: 'Processing image...',
        imageUrl: URL.createObjectURL(file),
        sender: 'bot'
      }
    ]);
    vscodeAPI.postMessage(newEventMessage('new_message', { imageUrl: (file as any).path }));
    setMessageProcessing(true);
  };

  const syncInProgress = syncProgress !== 100;
  const disableIteractions = messageProcessing || syncInProgress || !initialized;

  return (
    <div className="flex flex-col h-full vscode-dark text-white px-3 pb-4">
      <div className="flex-1 flex flex-col justify-start overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`py-4 px-2 border-b border-neutral-700 text-left ${
              message.sender === 'user' ? 'bg-neutral-800' : undefined
            }`}>
            <p className="text-sm font-medium text-neutral-300 mb-2">
              {message.sender === 'user' ? 'You' : 'Element AI'}
            </p>

            <MarkdownRender mdString={message.text} />

            {message.imageUrl && <img alt="preview image" className="mt-2" src={message.imageUrl} />}
          </div>
        ))}

        {streamResponse && (
          <div className={`py-4 px-2 border-b border-neutral-700 text-left`}>
            <p className="text-sm font-medium text-neutral-300 mb-2">Element AI</p>

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

      <div className="flex items-center gap-1">
        <div className="flex-1 w-full">
          <TextareaAutosize
            autoFocus
            value={input}
            placeholder="Ask ElementAI or type / for commands"
            className="p-2 bg-neutral-700 text-white rounded-md border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[2rem] max-h-[15rem] resize-none w-full"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (!disableIteractions && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        <FilePicker
          disabled={disableIteractions}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            handleImageUpload(file);
          }}
        />

        <Button disabled={disableIteractions} onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chat;
