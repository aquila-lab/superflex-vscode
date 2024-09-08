import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { PaperPlaneIcon } from '@radix-ui/react-icons';

import { FigmaButton } from '../figma/FigmaButton';
import { FilePicker } from './FilePicker';

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
    <div className="flex flex-row items-end min-h-10 bg-neutral-800 text-white rounded-md border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
      <TextareaAutosize
        autoFocus
        value={input}
        placeholder="Describe your UI component..."
        className="flex-1 p-2 pt-2.5 w-full min-h-10 max-h-[15rem] bg-neutral-800 text-white rounded-l-md resize-none focus:outline-none"
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
          className={`p-1.5 rounded-md ${disabled ? 'text-neutral-500' : 'text-neutral-400 hover:bg-neutral-700'}`}
          onClick={onSendClicked}>
          <span className="sr-only">Send</span>
          <PaperPlaneIcon className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export { InputAndExecuteToolbar };
