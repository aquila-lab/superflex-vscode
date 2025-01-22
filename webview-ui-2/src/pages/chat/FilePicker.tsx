import { ChangeEvent, useCallback, useRef } from 'react';
import { IoImage } from 'react-icons/io5';
import { cn } from '../../common/utils';

export const FilePicker = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const disabled = true;

  const handleImageSelected = (file: File) => {};

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      handleImageSelected(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleImageSelected]
  );

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
          <span className="hidden xs:block text-xs">Image</span>
        </label>
        <input
          hidden
          type="file"
          name="chat-file-picker"
          id="chat-file-picker"
          disabled={disabled}
          onChange={handleChange}
          accept={'image/jpeg, image/png'}
          ref={fileInputRef}
        />
      </div>
    </div>
  );
};
