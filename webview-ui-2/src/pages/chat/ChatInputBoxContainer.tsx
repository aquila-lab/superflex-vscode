import { ReactNode } from 'react';
import { cn, chatInputDisabledClasses, chatInputEnabledClasses } from '../../common/utils';
import { useInput } from '../../context/InputContext';

export const ChatInputBoxContainer = ({ children }: { children: ReactNode }) => {
  const { isDisabled } = useInput();

  return (
    <div className={cn(isDisabled ? chatInputDisabledClasses : chatInputEnabledClasses)}>
      <div className="relative flex flex-col bg-input rounded-md z-10">{children}</div>
    </div>
  );
};
