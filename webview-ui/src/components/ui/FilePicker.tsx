import React from 'react';
import { PaperClipIcon } from '@heroicons/react/24/outline';

interface FilePickerProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  disabled?: boolean;
}

const FilePicker: React.FunctionComponent<FilePickerProps> = ({ onChange, accept, disabled }) => {
  return (
    <div className="flex flex-col justify-center h-10">
      <div
        className={`flex-initial flex flex-col justify-center items-center rounded-md ${
          !disabled && 'hover:bg-neutral-700'
        }`}>
        <label
          htmlFor="chat-file-picker"
          className={`p-1.5 ${disabled ? 'text-neutral-500' : 'cursor-pointer text-neutral-400'}`}>
          <PaperClipIcon className="size-5" />
        </label>
        <input
          hidden={true}
          type="file"
          name="chat-file-picker"
          id="chat-file-picker"
          disabled={disabled}
          onChange={onChange}
          accept={accept}
        />
      </div>
    </div>
  );
};

export default FilePicker;
