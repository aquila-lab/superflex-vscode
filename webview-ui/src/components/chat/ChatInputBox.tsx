import React, { useEffect, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import Editor from 'react-simple-code-editor';
import { IoIosReturnLeft } from 'react-icons/io';
import { Cross2Icon, EyeNoneIcon } from '@radix-ui/react-icons';

import { FilePayload } from '../../../../shared/protocol';
import { useAppDispatch, useAppSelector } from '../../core/store';
import { addSelectedFile, removeSelectedFile, setSelectedFiles } from '../../core/chat/chatSlice';
import { Button } from '../ui/Button';
import { FileIcon } from '../ui/FileIcon';
import { FilePicker } from '../ui/FilePicker';
import { FigmaButton } from '../figma/FigmaButton';
import { TextareaAutosize } from '../ui/TextareaAutosize';
import { SyntaxHighlightedPre } from '../ui/MarkdownRender';
import { FileListItem } from './FileListItem';
import FileSelectorPopover from './FileSelectorPopover';

interface ChatInputBoxProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
  currentOpenFile: FilePayload | null;
  selectedCode: FilePayload[];
  fetchFiles: () => void;
  onSendClicked: (selectedFiles: FilePayload[], content: string) => Promise<boolean>;
  onImageSelected: (file: File) => void;
  onFigmaButtonClicked: () => void;
  onSelectedCodeRemoved: (id: string, removeAll?: boolean) => void;
  onPaste: () => Promise<boolean>;
}

const ChatInputBox: React.FunctionComponent<ChatInputBoxProps> = ({
  inputRef,
  disabled,
  currentOpenFile,
  selectedCode,
  fetchFiles,
  onSendClicked,
  onImageSelected,
  onFigmaButtonClicked,
  onSelectedCodeRemoved,
  onPaste
}) => {
  const dispatch = useAppDispatch();

  const selectedFiles = useAppSelector((state) => state.chat.selectedFiles);
  const isFigmaAuthenticated = useAppSelector((state) => state.chat.init.isFigmaAuthenticated);

  const [input, setInput] = useState('');
  const [visibleEditorID, setVisibleEditorID] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCode) {
      dispatch(setSelectedFiles(selectedCode));
      if (selectedCode.length > 0) {
        setVisibleEditorID(selectedCode[selectedCode.length - 1].id);
      }
    }
  }, [selectedCode]);

  useEffect(() => {
    if (!currentOpenFile) {
      dispatch(setSelectedFiles([...selectedFiles.filter((f) => !f.isCurrentOpenFile)]));
      return;
    }
    dispatch(addSelectedFile(currentOpenFile));
  }, [currentOpenFile]);

  async function handleSend(): Promise<void> {
    const formattedInput = formatInput();
    const isSendSuccessful = await onSendClicked(selectedFiles, formattedInput);
    if (!isSendSuccessful) {
      return;
    }

    setInput('');
    setVisibleEditorID(null);
    onSelectedCodeRemoved('', true);
  }

  function formatInput(): string {
    let formattedUserSelectedCodeInput = '';
    if (selectedCode.length > 0) {
      formattedUserSelectedCodeInput =
        '<user_selected_code>\n' +
        selectedCode
          .map((item) => {
            const fileExtension = item.relativePath.split('.').pop();
            return `\`\`\`${fileExtension} file="${item.relativePath}#${item.startLine}-${item.endLine}"\n\n${item.content}\n\`\`\``;
          })
          .join('\n\n') +
        '\n</user_selected_code>\n\n';
    }

    return formattedUserSelectedCodeInput + input;
  }

  function handleFileSelected(file: FilePayload): void {
    if (selectedFiles.find((f) => f.id === file.id)) {
      dispatch(removeSelectedFile(file));
      return;
    }
    dispatch(addSelectedFile(file));
  }

  function handleFileRemove(file: FilePayload): void {
    // Filter out the item with the matching `id`
    const updatedItems = selectedFiles.filter((f) => f.id !== file.id);

    // Update visible editors to match the new selection
    if (file.id === visibleEditorID && updatedItems.length > 0) {
      setVisibleEditorID(updatedItems[updatedItems.length - 1].id);
    } else if (updatedItems.length === 0) {
      setVisibleEditorID(null);
    }

    onSelectedCodeRemoved(file.id);
    dispatch(removeSelectedFile(file));
  }

  const toggleSelectedFileVisibility = (file: FilePayload) => {
    if (visibleEditorID === file.id) {
      if (selectedCode && selectedCode.length > 0 && selectedCode[selectedCode.length - 1].id !== file.id) {
        setVisibleEditorID(selectedCode[selectedCode.length - 1].id);
      } else {
        setVisibleEditorID(null);
      }
    } else {
      setVisibleEditorID(file.id);
    }
  };

  return (
    <div
      className={
        disabled
          ? "relative p-[1px] rounded-md before:content-[''] before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-[length:400%_400%] before:bg-[linear-gradient(115deg,#1bbe84_0%,#331bbe_16%,#be1b55_33%,#a6be1b_55%,#be1b55_67%)] before:animate-[gradient_3s_linear_infinite]"
          : 'border border-border rounded-md overflow-y-auto max-h-96'
      }>
      <div className="relative flex flex-col bg-input rounded-md z-10 ">
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
              <FileListItem
                key={file.relativePath}
                file={file}
                onShowSelectedCode={toggleSelectedFileVisibility}
                onRemoveFile={handleFileRemove}
              />
            ))
          )}
        </div>

        {/* Code Editor */}
        {selectedCode?.map(
          (item) =>
            visibleEditorID === item.id && (
              <div key={item.id} className="rounded-md mt-4 mx-2 border border-border bg-background">
                <div className="flex gap-1 pt-1 px-2 border-b border-border bg-[--vscode-panel-background]">
                  <FileIcon filename={item.name} className="size-5" />
                  <p className="text-xs text-foreground truncate max-w-36">{item.name}</p>
                  <p className="text-xs text-foreground truncate max-w-36">{`(${item?.startLine}-${item?.endLine})`}</p>
                  <div className="ml-auto flex gap-4">
                    <Button size="xs" variant="text" className="p-0" onClick={() => toggleSelectedFileVisibility(item)}>
                      <EyeNoneIcon className="size-4" />
                    </Button>
                    <Button size="xs" variant="text" className="p-0" onClick={() => handleFileRemove(item)}>
                      <Cross2Icon className="size-4" />
                    </Button>
                  </div>
                </div>

                <Editor
                  value={item?.content ?? ''}
                  onValueChange={() => {}} // Not editable
                  highlight={(code) => (
                    <SyntaxHighlightedPre>
                      <div dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(code).value }} />
                    </SyntaxHighlightedPre>
                  )}
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12
                  }}
                />
              </div>
            )
        )}

        {/* Chat input */}
        <div className="flex-1">
          <TextareaAutosize
            ref={inputRef}
            autoFocus
            value={input}
            placeholder="Describe your UI component... (⌘+; to focus)"
            className="border-0 shadow-none"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (!disabled && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            onPaste={async (e) => {
              // Hold the paste event from happening immediately
              e.preventDefault();

              const isPasteSuccessful = await onPaste();
              // If paste wasn't handled by our custom handler, manually insert the text
              if (!isPasteSuccessful) {
                const pastedText = e.clipboardData.getData('text');
                setInput((prev) => prev + pastedText);
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
              accept="image/jpeg, image/png"
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
    </div>
  );
};

export { ChatInputBox };
