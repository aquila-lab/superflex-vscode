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
  handleRemoveSelectedCode: (index: number, removeAllFlag?: boolean) => void;
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
  const [visibleEditors, setVisibleEditors] = useState<boolean[]>(selectedCode?.map(() => true) ?? []);

  useEffect(() => {
    if (selectedCode) {
      setVisibleEditors((prevVisibleEditors) => {
        // Map over the `selectedCode` array and set visibility
        return selectedCode.map((_, index) => {
          // If the current editor is already false, keep it false
          // eslint-disable-next-line no-unneeded-ternary, @typescript-eslint/no-unnecessary-boolean-literal-compare
          return prevVisibleEditors[index] === false ? false : true;
        });
      });
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
    handleRemoveSelectedCode(0, true);
    setSelectedCode([]);
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

  function handleCodeRemove(index: number = 0, removeAllFlag?: boolean): void {
    setSelectedCode((prev: SelectionPayload[] | null) => {
      if (removeAllFlag) {
        // Remove all selected code
        setVisibleEditors([]); // Clear all visibility states
        return [];
      } else if (prev && index >= 0 && index < prev.length) {
        // Ensure index is within bounds
        const updatedItems = [...prev];
        updatedItems.splice(index, 1);

        setVisibleEditors((prevVisible) => {
          const updatedVisible = [...prevVisible];
          updatedVisible.splice(index, 1); // Remove visibility for the deleted item
          return updatedVisible;
        });
        return updatedItems;
      }
      return prev; // Return unchanged if index is out of bounds
    });
    handleRemoveSelectedCode(index, removeAllFlag);
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

  const toggleEditorVisibility = (index: number) => {
    setVisibleEditors((prev) => prev.map((visible, i) => (i === index ? !visible : visible)));
  };

  const handleSelectedCodeShow = (name: string) => {
    if (selectedCode) {
      selectedCode.forEach((item, index) => {
        if (item.fileName === name && !visibleEditors[index]) {
          toggleEditorVisibility(index); // Show any hidden code for this file
        }
      });
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
              <div key={file.relativePath} className="flex items-center gap-1 bg-background rounded-md px-1.5 py-[1px]">
                <div
                  className="flex flex-row items-center gap-1 hover:cursor-pointer"
                  onClick={() => handleSelectedCodeShow(file.name)}>
                  <FileIcon height="20px" width="20px" filename={file.name} />
                  <p className="text-xs text-muted-foreground truncate max-w-36">{file.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-36">
                    {/* {EditorData && `(${EditorData?.startLine}-${EditorData?.endLine})`} */}
                  </p>
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

        {/* Code Editor */}

        {selectedCode?.map((item, index) => (
          <div key={index}>
            {visibleEditors && visibleEditors[index] && (
              <div className="rounded-xl ml-2 mr-2  border-gray-600 border-[1px] bg-background max-h-64 overflow-y-auto mt-4">
                <div className="flex gap-1 pt-2 pl-2 border-gray-600 border-b-[1px] bg-[--vscode-panel-background]">
                  <FileIcon height="22px" width="22px" filename={item.fileName} />
                  <p className="text-xm text-foreground truncate max-w-36">{item.fileName}</p>
                  <p className="text-xs text-foreground truncate max-w-36">{`(${item?.startLine}-${item?.endLine})`}</p>
                  <div className="ml-40 flex gap-4">
                    <Button size="xs" variant="text" className="p-0" onClick={() => toggleEditorVisibility(index)}>
                      <EyeNoneIcon className="size-4" />
                    </Button>
                    <Button size="xs" variant="text" className="p-0" onClick={() => handleCodeRemove(index)}>
                      <Cross2Icon className="size-4" />
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
                  // highlight={(code) => hljs.highlight(code, { language: 'js' }).value}
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12
                  }}
                />
              </div>
            )}
          </div>
        ))}

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
