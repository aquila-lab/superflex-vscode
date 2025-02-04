import { KeyboardEvent, ClipboardEvent, useCallback, ChangeEvent } from 'react';
import { TextareaAutosize } from '../../components/ui/TextareaAutosize';
import { EventResponseType } from '../../../../shared/protocol';
import { useConsumeMessage } from '../../hooks/useConsumeMessage';
import { useNewMessage } from '../../context/NewMessageContext';
import { useAttachment } from '../../context/AttachmentContext';
import { useInput } from '../../context/InputContext';
import { useFiles } from '../../context/FilesProvider';
import { useEditMode } from '../../context/EditModeContext';

export const ChatTextarea = () => {
  const { input, inputRef, setInput, focusInput } = useInput();
  const { selectedFiles } = useFiles();
  const { isEditMode } = useEditMode();
  const isDisabled = false;
  const messageId = '';

  const { sendMessageContent } = useNewMessage();
  const { figmaAttachment, removeAttachment } = useAttachment();

  const handleOnKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isDisabled && (input.length || figmaAttachment) && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessageContent({
          text: input,
          attachment: figmaAttachment
            ? {
                figma: figmaAttachment
              }
            : undefined,
          fromMessageID: messageId,
          files: selectedFiles
        });
        setInput('');
        removeAttachment();
      }
    },
    [isDisabled, messageId, input, figmaAttachment, sendMessageContent, setInput, selectedFiles]
  );

  const handleFocusChat = useCallback(() => focusInput(), []);

  const handleOnPaste = useCallback((e: ClipboardEvent<HTMLTextAreaElement>) => {}, []);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value), []);

  useConsumeMessage(EventResponseType.FOCUS_CHAT_INPUT, handleFocusChat);

  return (
    <div className="flex-1">
      <TextareaAutosize
        ref={inputRef}
        autoFocus
        value={input}
        placeholder="Describe your UI component... (⌘+; to focus)"
        className="border-0 shadow-none"
        onChange={handleInputChange}
        onKeyDown={handleOnKeyDown}
        onPaste={handleOnPaste}
        disabled={!isEditMode}
      />
    </div>
  );
};
