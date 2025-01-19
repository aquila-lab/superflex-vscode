import { KeyboardEvent, ClipboardEvent, useCallback, ChangeEvent } from 'react';
import { TextareaAutosize } from '../../components/ui/TextareaAutosize';
import { useInput } from '../../context/InputContext';

export const ChatTextarea = () => {
  const { input, isDisabled, inputRef, setInput, sendUserMessage, replaceWithPaste } = useInput();

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
    async (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = e.clipboardData.getData('text');
      const isPasteSuccessful = await replaceWithPaste(pastedText);

      if (isPasteSuccessful) {
        setInput(pastedText);
      }
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
