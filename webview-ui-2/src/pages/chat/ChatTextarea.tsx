import { KeyboardEvent, ClipboardEvent, useCallback, ChangeEvent, useContext } from 'react';
import { TextareaAutosize } from '../../components/ui/TextareaAutosize';
import { EventResponsePayload, EventResponseType } from '../../../../shared/protocol';
import { useConsumeMessage } from '../../hooks/useConsumeMessage';
import { EditModeContext } from '../../context/EditModeContext';
import { InputContextValue } from '../../common/utils';

export const ChatTextarea = ({ context }: { context: InputContextValue }) => {
  const { input, isDisabled, inputRef, setInput, sendUserMessage, replaceWithPaste } = context;
  const editModeContext = useContext(EditModeContext);

  const handleFocusChat = useCallback((payload: EventResponsePayload[EventResponseType.FOCUS_CHAT_INPUT]) => {
    inputRef.current?.focus();
  }, []);

  useConsumeMessage(EventResponseType.FOCUS_CHAT_INPUT, handleFocusChat);

  const handleInputBlur = useCallback(() => {
    if (editModeContext) {
      editModeContext.setIsEditMode(false);
    }
  }, []);

  const handleOnKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isDisabled && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    },
    [isDisabled, sendUserMessage]
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
        onBlur={handleInputBlur}
        placeholder="Describe your UI component... (⌘+; to focus)"
        className="border-0 shadow-none"
        onChange={handleInputChange}
        onKeyDown={handleOnKeyDown}
        onPaste={handleOnPaste}
      />
    </div>
  );
};
