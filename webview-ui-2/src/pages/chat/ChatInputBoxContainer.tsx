import { ReactNode, useContext, useEffect, useRef } from 'react';
import { cn, chatInputDisabledClasses, chatInputEnabledClasses, InputContextValue } from '../../common/utils';
import { EditModeContext } from '../../context/EditModeContext';

export const ChatInputBoxContainer = ({ children, context }: { children: ReactNode; context: InputContextValue }) => {
  const { isDisabled } = context;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editModeContext = useContext(EditModeContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node) && editModeContext) {
        editModeContext.setIsEditMode(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={cn(isDisabled ? chatInputDisabledClasses : chatInputEnabledClasses)}>
      <div className="relative flex flex-col bg-input rounded-md z-10">{children}</div>
    </div>
  );
};
