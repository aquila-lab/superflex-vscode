import { KeyboardEvent, ClipboardEvent, useCallback, ChangeEvent } from 'react';
import { TextareaAutosize } from '../../components/ui/TextareaAutosize';
import { EventResponseType } from '../../../../shared/protocol';
import { useConsumeMessage } from '../../hooks/useConsumeMessage';
import { InputContextValue } from '../../common/utils';
import { useNewMessage } from '../../context/NewMessageContext';
import { useAttachment } from '../../context/AttachmentContext';

export const ChatTextarea = ({ context, messageId }: { context: InputContextValue; messageId?: string }) => {
  const { input, isDisabled, inputRef, setInput, replaceWithPaste } = context;
  const { sendMessageContent } = useNewMessage();
  const { figmaAttachment, removeAttachment } = useAttachment();

  const handleFocusChat = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useConsumeMessage(EventResponseType.FOCUS_CHAT_INPUT, handleFocusChat);

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
          fromMessageID: messageId
        });
        setInput('');
        removeAttachment();
      }
    },
    [isDisabled, messageId, input, figmaAttachment, sendMessageContent, setInput]
  );

  const handleOnPaste = useCallback(
    (e: ClipboardEvent<HTMLTextAreaElement>) => {
      replaceWithPaste(e.clipboardData.getData('text'));
    },
    [replaceWithPaste]
  );

  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value), []);

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
      />
    </div>
  );
};
