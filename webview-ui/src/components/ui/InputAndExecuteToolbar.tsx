import React from 'react';
import { PaperPlaneIcon } from '@radix-ui/react-icons';

import { cn } from '../../common/utils';
import { FigmaButton } from '../figma/FigmaButton';
import { FilePicker } from './FilePicker';
import { TextareaAutosize } from './TextareaAutosize';

interface InputAndExecuteToolbarProps {
  input: string;
  disabled?: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendClicked: () => void;
  onFileSelected: (file: File) => void;
  onFigmaButtonClicked: () => void;
}

const InputAndExecuteToolbar: React.FunctionComponent<InputAndExecuteToolbarProps> = ({
  input,
  disabled,
  onInputChange,
  onSendClicked,
  onFileSelected,
  onFigmaButtonClicked
}) => {
  return (
    <div className="flex flex-row items-end min-h-10 bg-muted rounded-md border border-border focus:outline-none">
      <TextareaAutosize
        autoFocus
        value={input}
        placeholder="Describe your UI component..."
        className="flex-1 p-2 pt-2.5 min-h-10 max-h-[15rem] rounded-l-md border-0"
        onChange={onInputChange}
        onKeyDown={(e) => {
          if (!disabled && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendClicked();
          }
        }}
      />

      <FigmaButton disabled={disabled} onClick={onFigmaButtonClicked} />

      <FilePicker
        disabled={disabled}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          onFileSelected(file);
        }}
      />

      <div className="flex flex-col justify-center h-10 mx-1">
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'p-1.5 text-muted-foreground',
            disabled ? 'opacity-60' : 'cursor-pointer hover:text-foreground'
          )}
          onClick={onSendClicked}>
          <span className="sr-only">Send</span>
          <PaperPlaneIcon className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export { InputAndExecuteToolbar };
