import { ReactNode } from 'react';
import { cn, chatInputDisabledClasses, chatInputEnabledClasses, InputContextValue } from '../../common/utils';

export const ChatInputBoxContainer = ({ children, context }: { children: ReactNode, context: InputContextValue }) => {
  const { isDisabled } = context;

  return (
    <div className={cn(isDisabled ? chatInputDisabledClasses : chatInputEnabledClasses)}>
      <div className="relative flex flex-col bg-input rounded-md z-10">{children}</div>
    </div>
  );
};
