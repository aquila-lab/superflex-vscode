import React from 'react';
import { PaperClipIcon } from '@heroicons/react/24/outline';

interface FilePickerProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  disabled?: boolean;
}

const FilePicker: React.FunctionComponent<FilePickerProps> = ({ onChange, accept, disabled }) => {
  return (
    <div className="flex-initial flex flex-col justify-center items-center h-9 rounded-md hover:bg-neutral-800">
      <label htmlFor="chat-file-picker" className="cursor-pointer p-2 text-neutral-400">
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
  );
};

export default FilePicker;
