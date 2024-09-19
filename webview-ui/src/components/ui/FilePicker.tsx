import React, { useRef } from 'react';
import { IoImage } from 'react-icons/io5';

import { cn } from '../../common/utils';

interface FilePickerProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  disabled?: boolean;
}

const FilePicker: React.FC<FilePickerProps> = ({ onChange, accept, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event);

    // Reset the file input value after onChange is called
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="flex-initial flex flex-col justify-center items-center rounded-md">
        <label
          htmlFor="chat-file-picker"
          className={cn(
            'flex items-center gap-1 p-1.5 text-muted-foreground',
            disabled ? 'opacity-60' : 'cursor-pointer hover:text-foreground'
          )}>
          <IoImage className="size-3.5" />
          <span className="text-xs">Image</span>
        </label>
        <input
          hidden
          type="file"
          name="chat-file-picker"
          id="chat-file-picker"
          disabled={disabled}
          onChange={handleChange}
          accept={accept}
          ref={fileInputRef}
        />
      </div>
    </div>
  );
};

export { FilePicker };
