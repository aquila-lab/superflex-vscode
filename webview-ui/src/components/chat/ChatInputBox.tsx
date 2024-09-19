import React, { useState } from 'react';
import { IoIosReturnLeft } from 'react-icons/io';

import { cn } from '../../common/utils';
import { FigmaButton } from '../figma/FigmaButton';
import { FilePicker } from '../ui/FilePicker';
import { TextareaAutosize } from '../ui/TextareaAutosize';
import { useAppSelector } from '../../core/store';

interface ChatInputBoxProps {
  disabled?: boolean;
  onFigmaButtonClicked: () => void;
  onFileSelected: (file: File) => void;
  onSendClicked: (content: string) => void;
}

const ChatInputBox: React.FunctionComponent<ChatInputBoxProps> = ({
  disabled,
  onFigmaButtonClicked,
  onFileSelected,
  onSendClicked
}) => {
  const isFigmaAuthenticated = useAppSelector((state) => state.chat.init.isFigmaAuthenticated);

  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSendClicked(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col bg-input rounded-md border border-border focus:outline-none">
      <div className="flex-1">
        <TextareaAutosize
          autoFocus
          value={input}
          placeholder="Describe your UI component..."
          className="p-2 border-0 shadow-none"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (!disabled && e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
      </div>

      <div className="flex flex-row justify-between items-center gap-4 py-1 pr-2">
        <div className="flex flex-row items-center gap-1">
          <FigmaButton disabled={disabled && isFigmaAuthenticated} onClick={onFigmaButtonClicked} />
          <FilePicker
            disabled={disabled}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              onFileSelected(file);
            }}
          />
        </div>

        <div className="flex flex-row items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex items-center gap-1 py-1 px-2 text-muted-foreground rounded-md',
              disabled ? 'opacity-60' : 'cursor-pointer hover:text-button-secondary-foreground',
              input.length > 0 &&
                'bg-button-secondary-background-hover text-button-secondary-foreground opacity-80 hover:opacity-100'
            )}
            onClick={handleSend}>
            <span className="sr-only">Enter</span>
            <IoIosReturnLeft className="size-4" aria-hidden="true" />
            <span className="text-xs">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export { ChatInputBox };
