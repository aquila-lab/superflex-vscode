import React, { useState } from 'react';
import { IoIosReturnLeft } from 'react-icons/io';

import { Button } from '../ui/Button';
import { FilePicker } from '../ui/FilePicker';
import { useAppSelector } from '../../core/store';
import { FigmaButton } from '../figma/FigmaButton';
import FileSelectorPopover from './FileSelectorPopover';
import { TextareaAutosize } from '../ui/TextareaAutosize';

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
      {/* Chat top toolbar */}
      <div className="flex flex-row items-center gap-2">
        <FileSelectorPopover onFileSelected={() => {}} />
      </div>

      {/* Chat input */}
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

      {/* Chat bottom toolbar */}
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
          <Button
            size="xs"
            variant="text"
            active={!disabled && input.length > 0 ? 'active' : 'none'}
            disabled={disabled}
            className={disabled ? 'opacity-60' : ''}
            onClick={handleSend}>
            <span className="sr-only">Enter</span>
            <IoIosReturnLeft className="size-4" aria-hidden="true" />
            <span>send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ChatInputBox };
