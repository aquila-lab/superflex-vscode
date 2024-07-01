import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { VSCodeWrapper } from './api/vscodeApi';
import { Button, FilePicker } from './components';
import { newEventMessage } from './api/protocol';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  imageUrl?: string;
};

const Chat: React.FunctionComponent<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}> = ({ vscodeAPI }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome, I'm your Copilot and I'm here to help you get things done faster.\n\nI'm powered by AI, so surprises and mistakes are possible. Make sure to verify any generated code or suggestions, and share feedback so that we can learn and improve.",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), text: input, sender: 'user' }]);
      setInput('');
    }
  };

  const handleImageUpload = (file: File) => {
    setMessages([
      ...messages,
      {
        id: Date.now(),
        text: 'Processing image...',
        imageUrl: URL.createObjectURL(file),
        sender: 'bot'
      }
    ]);

    vscodeAPI.postMessage(
      newEventMessage('process_message', { imageUrl: URL.createObjectURL(file) })
    );

    vscodeAPI.onMessage((message) => {
      switch (message.command) {
        case 'message_processed':
          setMessages([
            ...messages,
            {
              id: Date.now(),
              text: 'Generating component...',
              sender: 'bot'
            }
          ]);
          break;
      }
    });
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
            <p className="whitespace-pre-wrap">{message.text}</p>
            {message.imageUrl && (
              <img alt="preview image" className="mt-2" src={message.imageUrl} />
            )}
          </div>
        ))}
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
