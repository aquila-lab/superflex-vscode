import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Markdown from 'markdown-to-jsx';

import { VSCodeWrapper } from './api/vscodeApi';
import { Button, FilePicker } from './components';
import { newEventMessage } from './api/protocol';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  imageUrl?: string;
};

const Chat: React.FunctionComponent<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}> = ({ vscodeAPI }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome, I'm your Copilot and I'm here to help you get things done faster.\n\nI'm powered by AI, so surprises and mistakes are possible. Make sure to verify any generated code or suggestions, and share feedback so that we can learn and improve.",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [streamResponse, setStreamResponse] = useState('');

  useEffect(
    () =>
      vscodeAPI.onMessage((message) => {
        switch (message.command) {
          case 'new_message':
            setMessages([
              ...messages,
              {
                id: message.id,
                text: 'Starting to process your message...',
                sender: 'bot'
              }
            ]);
            break;
          case 'message_processing':
            setStreamResponse((prev) => prev + message.data);
            break;
        }
      }),
    [vscodeAPI, messages]
  );

  useEffect(() => {
    // If we are here that means we are authenticated and have active subscription
    vscodeAPI.postMessage(newEventMessage('start_project_indexing'));
  }, [vscodeAPI]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: `${Date.now()}`, text: input, sender: 'user' }]);

      vscodeAPI.postMessage(newEventMessage('process_message', { message: input }));
    }

    setInput('');
  };

  const handleImageUpload = (file: File) => {
    setMessages([
      ...messages,
      {
        id: `${Date.now()}`,
        text: 'Processing image...',
        imageUrl: URL.createObjectURL(file),
        sender: 'bot'
      }
    ]);

    vscodeAPI.postMessage(newEventMessage('process_message', { imageUrl: (file as any).path }));
  };

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

            <Markdown>{message.text}</Markdown>

            {message.imageUrl && <img alt="preview image" className="mt-2" src={message.imageUrl} />}
          </div>
        ))}

        {streamResponse && (
          <div className={`py-4 px-2 border-b border-neutral-700 text-left`}>
            <p className="text-sm font-medium text-neutral-300 mb-2">Element AI</p>

            <Markdown>{streamResponse}</Markdown>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <TextareaAutosize
          autoFocus
          value={input}
          placeholder="Ask ElementAI or type / for commands"
          className="flex-1 p-2 bg-neutral-800 text-white rounded-md border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[2rem] max-h-[15rem]"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />

        <FilePicker
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            handleImageUpload(file);
          }}
        />

        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
};

export default Chat;
