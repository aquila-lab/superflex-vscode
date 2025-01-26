import { ReactNode, useCallback, RefObject, SetStateAction } from 'react';
import { MessageType } from '../../../../shared/model';
import { useNewMessage } from '../../context/NewMessageContext';
import { useSync } from '../../context/SyncProvider';
import { InputProvider } from '../../context/InputContext';
import { EditInputProvider } from '../../context/EditInputContext';

export const InputController = ({ children }: { children: ReactNode }) => {
  const { isSyncing } = useSync();
  const { sendMessageContent, isMessageProcessing, stopStreaming, lastUserMessage } = useNewMessage();
  const isDisabled = isMessageProcessing || isSyncing; // TODO || !initState.isInitialized || isFigmaFileLoading

  const stopMessage = useCallback(
    (setInput: (value: SetStateAction<string>) => void, inputRef: RefObject<HTMLTextAreaElement>) => {
      if (lastUserMessage) {
        stopStreaming();
        setInput(lastUserMessage);
        inputRef.current?.focus();
      }
    },
    [lastUserMessage]
  );

  const sendUserMessage = useCallback(
    async (input: string, setInput: (value: SetStateAction<string>) => void, messageId?: string) => {
      if (!input.trim()) return;

      sendMessageContent([{ type: MessageType.Text, text: input.trim() }], [], messageId);
      setInput('');
    },
    [sendMessageContent]
  );

  const replaceWithPaste = useCallback((setInput: (value: SetStateAction<string>) => void, pastedText: string) => {
    // TODO
    setInput(pastedText);
  }, []);

  return (
    <InputProvider
      isDisabled={isDisabled}
      stopMessage={stopMessage}
      sendUserMessage={sendUserMessage}
      replaceWithPaste={replaceWithPaste}>
      <EditInputProvider
        isDisabled={isDisabled}
        stopMessage={stopMessage}
        sendUserMessage={sendUserMessage}
        replaceWithPaste={replaceWithPaste}>
        {children}
      </EditInputProvider>
    </InputProvider>
  );
};
