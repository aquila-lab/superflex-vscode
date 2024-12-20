import React, { useEffect, useState } from 'react';
import { IoIosReturnLeft } from 'react-icons/io';

import { FilePayload } from '../../../../shared/protocol';
import { useAppDispatch, useAppSelector } from '../../core/store';
import {
  addSelectedFile,
  removeSelectedFile,
  setPreviewVisibleForFileID,
  setSelectedFiles
} from '../../core/chat/chatSlice';
import { Button } from '../ui/Button';
import { FilePicker } from '../ui/FilePicker';
import { FigmaButton } from '../figma/FigmaButton';
import { TextareaAutosize } from '../ui/TextareaAutosize';
import { FileTab } from './FileTab';
import { FilePreview } from './FilePreview';
import FileSelectorPopover from './FileSelectorPopover';
import { PremiumFeatureModal } from '../billing/PremiumFeatureModal';
import posthog from 'posthog-js';

interface ChatInputBoxProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
  currentOpenFile: FilePayload | null;
  fetchFiles: () => void;
  fetchFileContent: (file: FilePayload) => Promise<string>;
  onSendClicked: (selectedFiles: FilePayload[], content: string) => Promise<boolean>;
  onImageSelected: (file: File) => void;
  onFigmaButtonClicked: () => void;
  onPaste: (text: string) => Promise<boolean>;
  onSubscribe: (source?: string) => void;
}

const ChatInputBox: React.FunctionComponent<ChatInputBoxProps> = ({
  inputRef,
  disabled,
  currentOpenFile,
  fetchFiles,
  fetchFileContent,
  onSendClicked,
  onImageSelected,
  onFigmaButtonClicked,
  onPaste,
  onSubscribe
}) => {
  const dispatch = useAppDispatch();

  const selectedFiles = useAppSelector((state) => state.chat.selectedFiles);
  const isFigmaAuthenticated = useAppSelector((state) => state.chat.init.isFigmaAuthenticated);
  const previewVisibleForFileID = useAppSelector((state) => state.chat.previewVisibleForFileID);
  const subscriptionPlan = useAppSelector((state) => state.user.subscription?.plan);

  const [input, setInput] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<'figma' | 'image' | null>(null);

  useEffect(() => {
    if (!currentOpenFile) {
      dispatch(setSelectedFiles([...selectedFiles.filter((f) => !f.isCurrentOpenFile)]));
      return;
    }
    dispatch(addSelectedFile(currentOpenFile));
  }, [currentOpenFile]);

  async function handleSend(): Promise<void> {
    const isSendSuccessful = await onSendClicked(selectedFiles, input);
    if (!isSendSuccessful) {
      return;
    }

    setInput('');
    dispatch(setPreviewVisibleForFileID(null));
  }

  const togglePreview = (file: FilePayload): void => {
    if (previewVisibleForFileID === file.id) {
      dispatch(setPreviewVisibleForFileID(null));
      return;
    }
    dispatch(setPreviewVisibleForFileID(file.id));
  };

  function handleImageSelected(file: File): void {
    if (subscriptionPlan?.name.toLowerCase().includes('free')) {
      setPremiumFeature('image');
      setShowPremiumModal(true);
      return;
    }

    onImageSelected(file);
  }

  function handleFigmaButtonClicked(): void {
    if (subscriptionPlan?.name.toLowerCase().includes('free')) {
      setPremiumFeature('figma');
      setShowPremiumModal(true);
      return;
    }

    onFigmaButtonClicked();
  }

  function handleFileSelected(file: FilePayload): void {
    if (selectedFiles.find((f) => f.id === file.id)) {
      dispatch(removeSelectedFile(file));
      return;
    }
    dispatch(addSelectedFile(file));
  }

  function handleFileRemove(file: FilePayload): void {
    if (previewVisibleForFileID === file.id) {
      dispatch(setPreviewVisibleForFileID(null));
    }

    dispatch(removeSelectedFile(file));
  }

  return (
    <>
      <div
        className={
          disabled
            ? "relative p-[1px] rounded-md before:content-[''] before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-[length:400%_400%] before:bg-[linear-gradient(115deg,#1bbe84_0%,#331bbe_16%,#be1b55_33%,#a6be1b_55%,#be1b55_67%)] before:animate-[gradient_3s_linear_infinite]"
            : 'border border-border rounded-md overflow-y-auto max-h-96'
        }>
        <div className="relative flex flex-col bg-input rounded-md z-10 ">
          {/* File preview */}
          {previewVisibleForFileID &&
            selectedFiles
              .filter((file) => file.id === previewVisibleForFileID)
              .map((file) => <FilePreview key={file.id} file={file} fetchFileContent={fetchFileContent} />)}

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
                <FileTab
                  key={file.id}
                  file={file}
                  previewVisibleForFileID={previewVisibleForFileID}
                  onTogglePreview={togglePreview}
                  onRemoveFile={handleFileRemove}
                />
              ))
            )}
          </div>

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
                const pastedText = e.clipboardData.getData('text');
                const isPasteSuccessful = await onPaste(pastedText);
                if (isPasteSuccessful) {
                  setInput((prev) => prev.replace(pastedText, ''));
                }
              }}
            />
          </div>

          {/* Chat bottom toolbar */}
          <div className="flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2">
            <div className="flex flex-row items-center gap-1">
              <FigmaButton disabled={disabled && isFigmaAuthenticated} onClick={handleFigmaButtonClicked} />
              <FilePicker
                disabled={disabled}
                accept="image/jpeg, image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  handleImageSelected(file);
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

      <PremiumFeatureModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
          setPremiumFeature(null);
        }}
        onSubscribe={(link) => {
          posthog.capture('upgrade_to_premium', {
            feature: `${premiumFeature}-to-code`
          });

          if (link) {
            onSubscribe(link);
            return;
          }

          const url = premiumFeature
            ? `https://app.superflex.ai/pricing?source=${premiumFeature}`
            : 'https://app.superflex.ai/pricing';
          onSubscribe(url);
        }}
        title={`Upgrade to Access ${premiumFeature === 'figma' ? 'Figma' : 'Screenshot'} to Code`}
        description={
          premiumFeature === 'figma'
            ? 'Figma integration is a premium feature. Upgrade your plan to connect your Figma account and unlock powerful design-to-code capabilities!'
            : 'Screenshot integration is a premium feature. Upgrade your plan convert your screenshots into clean production ready code!'
        }
      />
    </>
  );
};

export { ChatInputBox };
