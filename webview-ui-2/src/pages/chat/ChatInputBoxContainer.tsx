import { ReactNode, useEffect, useRef } from 'react';
import { cn, chatInputDisabledClasses, chatInputEnabledClasses } from '../../common/utils';
import { useEditMode } from '../../context/EditModeContext';
import { useMessages } from '../../context/MessagesContext';
import { useInput } from '../../context/InputContext';

export const ChatInputBoxContainer = ({ children }: { children: ReactNode }) => {
  const { input } = useInput();
  const isDisabled = false;
  const messageId = '';
  const { setIsEditMode, setIsDraft } = useEditMode();

  const { getMessage, updateUserMessage } = useMessages();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsEditMode(false);

        if (messageId) {
          const message = getMessage(messageId);
          if (message?.content.text !== input) {
            setIsDraft(true);
            updateUserMessage(messageId, input);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [messageId, input, setIsEditMode, setIsDraft]);

  return (
    <div ref={wrapperRef} className={cn(isDisabled ? chatInputDisabledClasses : chatInputEnabledClasses)}>
      <div className="relative flex flex-col bg-input rounded-md z-10">{children}</div>
    </div>
  );
};
