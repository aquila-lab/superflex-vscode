import { ReactNode, useContext, useEffect, useRef } from 'react';
import { cn, chatInputDisabledClasses, chatInputEnabledClasses, InputContextValue } from '../../common/utils';
import { EditModeContext } from '../../context/EditModeContext';
import { useMessages } from '../../context/MessagesContext';
import { MessageType } from '../../../../shared/model';

export const ChatInputBoxContainer = ({
  children,
  context,
  messageId
}: {
  children: ReactNode;
  context: InputContextValue;
  messageId?: string;
}) => {
  const { isDisabled, input } = context;
  const { getMessage, updateUserMessage } = useMessages();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editModeContext = useContext(EditModeContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node) && editModeContext) {
        editModeContext.setIsEditMode(false);

        if (messageId) {
          const message = getMessage(messageId);
          if (message?.content.type === MessageType.Text && message.content.text !== input) {
            editModeContext.setIsDraft(true);
            updateUserMessage(messageId, input);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editModeContext, messageId, input]);

  return (
    <div ref={wrapperRef} className={cn(isDisabled ? chatInputDisabledClasses : chatInputEnabledClasses)}>
      <div className="relative flex flex-col bg-input rounded-md z-10">{children}</div>
    </div>
  );
};
