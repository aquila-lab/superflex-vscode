import { ReactNode, useCallback, RefObject, SetStateAction } from 'react';
import { useNewMessage } from '../../context/NewMessageContext';
import { useSync } from '../../context/SyncProvider';
import { InputProvider } from '../../context/InputContext';
import { EditInputProvider } from '../../context/EditInputContext';
import { useGlobal } from '../../context/GlobalContext';

export const InputController = ({ children }: { children: ReactNode }) => {
  const { isSyncing } = useSync();
  const { isMessageProcessing, stopStreaming, lastUserMessage } = useNewMessage();
  const { isInitialized } = useGlobal();
  const isDisabled = isMessageProcessing || isSyncing || !isInitialized;

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

  const replaceWithPaste = useCallback((setInput: (value: SetStateAction<string>) => void, pastedText: string) => {
    // TODO
    setInput(pastedText);
  }, []);

  return (
    <InputProvider isDisabled={isDisabled} stopMessage={stopMessage} replaceWithPaste={replaceWithPaste}>
      <EditInputProvider isDisabled={isDisabled} stopMessage={stopMessage} replaceWithPaste={replaceWithPaste}>
        {children}
      </EditInputProvider>
    </InputProvider>
  );
};
