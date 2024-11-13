import React, { useEffect, useState } from 'react';
import { IoIosReturnLeft } from 'react-icons/io';
import { Cross2Icon, EyeNoneIcon } from '@radix-ui/react-icons';
import { FilePayload, SelectionPayload } from '../../../../shared/protocol';
import { Button } from '../ui/Button';
import { FilePicker } from '../ui/FilePicker';
import { useAppDispatch, useAppSelector } from '../../core/store';
import { FigmaButton } from '../figma/FigmaButton';
import FileSelectorPopover from './FileSelectorPopover';
import { TextareaAutosize } from '../ui/TextareaAutosize';
import { addSelectedFile, removeSelectedFile, setSelectedFiles } from '../../core/chat/chatSlice';
import Editor from 'react-simple-code-editor';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import { SyntaxHighlightedPre, FileIcon } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface ChatInputBoxProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
  currentOpenFile: FilePayload | null;
  fetchFiles: () => void;
  onSendClicked: (selectedFiles: FilePayload[], content: string) => Promise<boolean>;
  onImageSelected: (file: File) => void;
  onFigmaButtonClicked: () => void;
  selectedCode: SelectionPayload[] | null;
  setSelectedCode: React.Dispatch<React.SetStateAction<SelectionPayload[] | null>>;
  handleRemoveSelectedCode: (id: string, removeAllFlag?: boolean) => void;
}

const ChatInputBox: React.FunctionComponent<ChatInputBoxProps> = ({
  inputRef,
  disabled,
  currentOpenFile,
  fetchFiles,
  onSendClicked,
  onImageSelected,
  onFigmaButtonClicked,
  selectedCode,
  setSelectedCode,
  handleRemoveSelectedCode
}) => {
  const dispatch = useAppDispatch();

  const selectedFiles = useAppSelector((state) => state.chat.selectedFiles);
  const isFigmaAuthenticated = useAppSelector((state) => state.chat.init.isFigmaAuthenticated);

  const [input, setInput] = useState('');
  // const [EditorData, setEditorData] = useState<SelectionPayload[]>(selectedCode ?? []);
  // const [EditToggle, setEditToggle] = useState<boolean>(false);
  const [visibleEditorId, setVisibleEditorId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCode) {
      console.log('selected code', selectedCode);
      const filePayloads = selectedCode.map((code) => ({
        id: code.id,
        name: code.fileName,
        path: code.filePath,
        relativePath: code.relativePath,
        startLine: code.startLine,
        endLine: code.endLine
      }));

      dispatch(setSelectedFiles(filePayloads));
      // set latest id
      if (selectedCode.length > 0) {
        setVisibleEditorId(selectedCode[selectedCode.length - 1].id);
      }
    }
    console.log('selecte files', selectedFiles);
  }, [selectedCode]);

  useEffect(() => {
    if (!currentOpenFile) {
      dispatch(setSelectedFiles([...selectedFiles.filter((f) => !f.isCurrentOpenFile)]));
      return;
    }
    dispatch(addSelectedFile(currentOpenFile));
    console.log('selected files', selectedFiles);
  }, [currentOpenFile]);

  async function handleSend(): Promise<void> {
    const formattedInput = formatInput();
    const isSendSuccessful = await onSendClicked(selectedFiles, formattedInput);
    if (!isSendSuccessful) {
      return;
    }
    handleRemoveSelectedCode('', true);
    setSelectedCode([]);
    setInput('');
  }

  function handleFileSelected(file: FilePayload): void {
    if (selectedFiles.find((f) => f.id === file.id)) {
      dispatch(removeSelectedFile(file.id));
      return;
    }
    dispatch(addSelectedFile(file));
  }

  function handleCodeRemove(id: string, removeAllFlag?: boolean): void {
    setSelectedCode((prev: SelectionPayload[] | null) => {
      if (removeAllFlag) {
        // Remove all selected code
        setVisibleEditorId(null); // Clear all visibility states
        return [];
      } else if (prev) {
        // Filter out the item with the matching `id`
        const updatedItems = prev.filter((item) => item.id !== id);

        // Update visible editors to match the new selection
        if (id === visibleEditorId && updatedItems.length > 0) {
          setVisibleEditorId(updatedItems[updatedItems.length - 1].id);
        } else if (updatedItems.length === 0) {
          setVisibleEditorId(null);
        }

        return updatedItems;
      }
      return prev; // Return unchanged if prev is null
    });

    console.log('id to send', id);
    handleRemoveSelectedCode(id, removeAllFlag);
    dispatch(removeSelectedFile(id));
  }

  function formatInput(): string {
    if (selectedCode) {
      const formattedInput =
        selectedCode
          .map((item) => {
            const fileExtension = item.fileName.split('.').pop();
            return `\`\`\`${fileExtension} file="${item.relativePath}#${item.startLine}-${item.endLine}"\n<superflex_domain_knowledge>\n${item.selectedText.replace(/"/g, '\\"')}\n</superflex_domain_knowledge>\n\`\`\``;
          })
          .join('\n\n') +
        '\n\n' +
        input;
      return formattedInput;
    } else {
      return input;
    }
  }

  const toggleEditorVisibility = (id: string) => {
    if (visibleEditorId === id) {
      if (selectedCode && selectedCode.length > 0 && selectedCode[selectedCode.length - 1].id !== id) {
        setVisibleEditorId(selectedCode[selectedCode.length - 1].id);
      } else {
        setVisibleEditorId(null);
      }
    } else {
      setVisibleEditorId(id);
    }
  };

  const handleSelectedCodeShow = (id: string) => {
    toggleEditorVisibility(id);
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
              <div
                key={file.relativePath}
                className={
                  visibleEditorId === file.id
                    ? 'border border-primary flex items-center gap-1 bg-background rounded-md px-1.5 py-[1px]'
                    : 'flex items-center gap-1 bg-background rounded-md px-1.5 py-[1px]' // Add border if IDs match
                }>
                <div
                  className="flex flex-row items-center gap-1 hover:cursor-pointer"
                  onClick={() => handleSelectedCodeShow(file.id)}>
                  <FileIcon height="20px" width="20px" filename={file.name} />
                  <p className="text-xs text-muted-foreground truncate max-w-36">{file.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-36">
                    {file.startLine && file.endLine && `(${file?.startLine}-${file?.endLine})`}
                  </p>
                  <p className="text-xs text-muted-secondary-foreground">
                    {file.isCurrentOpenFile ? 'Current file' : 'File'}
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="text"
                  className="p-0"
                  onClick={() => handleCodeRemove(file.id)}
                  aria-label={`remove-${file.name}`}>
                  <Cross2Icon className="size-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Code Editor */}
        {selectedCode?.map(
          (item) =>
            visibleEditorId === item.id && (
              <div key={item.id} className="rounded-xl ml-2 mr-2 border-gray-600 border-[1px] bg-background  mt-4">
                <div className="flex gap-1 pt-1  pl-2 pr-2 border-gray-600 border-b-[1px] bg-[--vscode-panel-background]">
                  <FileIcon height="19px" width="19px" filename={item.fileName} />
                  <p className="text-[11px] text-foreground truncate max-w-36">{item.fileName}</p>
                  <p className="text-[11px] text-foreground truncate max-w-36">{`(${item?.startLine}-${item?.endLine})`}</p>
                  <div className="ml-auto flex gap-4">
                    <Button size="xs" variant="text" className="p-0" onClick={() => toggleEditorVisibility(item.id)}>
                      <EyeNoneIcon className="size-[14px]" />
                    </Button>
                    <Button size="xs" variant="text" className="p-0" onClick={() => handleCodeRemove(item.id)}>
                      <Cross2Icon className="size-[14px]" />
                    </Button>
                  </div>
                </div>

                <Editor
                  value={item?.selectedText || ''}
                  onValueChange={(code) => console.log('not editable')}
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
