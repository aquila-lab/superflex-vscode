import React, { useEffect, useState } from 'react';
import { IoIosReturnLeft } from 'react-icons/io';
import { Cross2Icon } from '@radix-ui/react-icons';

import { FilePayload } from '../../../../shared/protocol';
import { Button } from '../ui/Button';
import { FilePicker } from '../ui/FilePicker';
import { useAppDispatch, useAppSelector } from '../../core/store';
import { FigmaButton } from '../figma/FigmaButton';
import FileSelectorPopover from './FileSelectorPopover';
import { TextareaAutosize } from '../ui/TextareaAutosize';
import { addSelectedFile, removeSelectedFile, setSelectedFiles } from '../../core/chat/chatSlice';

interface ChatInputBoxProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
  currentOpenFile: FilePayload | null;
  fetchFiles: () => void;
  onSendClicked: (selectedFiles: FilePayload[], content: string) => boolean;
  onImageSelected: (file: File) => void;
  onFigmaButtonClicked: () => void;
}

const ChatInputBox: React.FunctionComponent<ChatInputBoxProps> = ({
  inputRef,
  disabled,
  currentOpenFile,
  fetchFiles,
  onSendClicked,
  onImageSelected,
  onFigmaButtonClicked
}) => {
  const dispatch = useAppDispatch();

  const selectedFiles = useAppSelector((state) => state.chat.selectedFiles);
  const isFigmaAuthenticated = useAppSelector((state) => state.chat.init.isFigmaAuthenticated);

  const [input, setInput] = useState('');

  useEffect(() => {
    if (!currentOpenFile) {
      dispatch(setSelectedFiles([...selectedFiles.filter((f) => !f.isCurrentOpenFile)]));
      return;
    }

    dispatch(addSelectedFile(currentOpenFile));
  }, [currentOpenFile]);

  function handleSend(): void {
    const isSendSuccessful = onSendClicked(selectedFiles, input);
    if (!isSendSuccessful) {
      return;
    }
    setInput('');
  }

  function handleFileSelected(file: FilePayload): void {
    if (selectedFiles.find((f) => f.relativePath === file.relativePath)) {
      handleFileRemove(file);
      return;
    }

    dispatch(addSelectedFile(file));
  }

  function handleFileRemove(file: FilePayload): void {
    dispatch(removeSelectedFile(file));
  }

  return (
    <div className="flex flex-col bg-input rounded-md border border-border focus:outline-none">
      {/* Chat top toolbar */}
      <div className="flex flex-wrap gap-2 p-2 pb-0.5">
        <FileSelectorPopover
          selectedFiles={selectedFiles}
          fetchFiles={fetchFiles}
          onFileSelected={handleFileSelected}
        />

        {selectedFiles.length === 0 ? (
          <p className="text-xs text-muted-foreground self-center">Add context</p>
        ) : (
          selectedFiles.map((file) => (
            <div key={file.relativePath} className="flex items-center gap-1 bg-background rounded-md px-1.5 py-[1px]">
              <div className="flex flex-row items-center gap-1">
                <p className="text-xs text-muted-foreground truncate max-w-36">{file.name}</p>
                <p className="text-xs text-muted-secondary-foreground">
                  {file.isCurrentOpenFile ? 'Current file' : 'File'}
                </p>
              </div>
              <Button
                size="xs"
                variant="text"
                className="p-0"
                onClick={() => handleFileRemove(file)}
                aria-label={`remove-${file.name}`}>
                <Cross2Icon className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Chat input */}
      <div className="flex-1">
        <TextareaAutosize
          ref={inputRef}
          autoFocus
          value={input}
          placeholder="Describe your UI component..."
          className="border-0 shadow-none"
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
      <div className="flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2">
        <div className="flex flex-row items-center gap-1">
          <FigmaButton disabled={disabled && isFigmaAuthenticated} onClick={onFigmaButtonClicked} />
          <FilePicker
            disabled={disabled}
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onImageSelected(file);
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
