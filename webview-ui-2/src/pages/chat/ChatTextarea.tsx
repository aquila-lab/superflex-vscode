import { KeyboardEvent, ClipboardEvent, useCallback, ChangeEvent } from 'react';
import { TextareaAutosize } from '../../components/ui/TextareaAutosize';
import { EventResponseType } from '../../../../shared/protocol';
import { useConsumeMessage } from '../../hooks/useConsumeMessage';
import { InputContextValue } from '../../common/utils';

export const ChatTextarea = ({ context, messageId }: { context: InputContextValue; messageId?: string }) => {
  const { input, isDisabled, inputRef, setInput, sendUserMessage, replaceWithPaste } = context;

  const handleFocusChat = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useConsumeMessage(EventResponseType.FOCUS_CHAT_INPUT, handleFocusChat);

  const handleOnKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isDisabled && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage(messageId);
      }
    },
    [isDisabled, sendUserMessage, messageId]
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
