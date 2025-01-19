import { useInput } from '../../context/InputContext';
import { ChatBottomToolbar } from './ChatBottomToolbar';
import { ChatTextarea } from './ChatTextarea';
import { ChatTopToolbar } from './ChatTopToolbar';

export const ChatInputBox = () => {
  const { isDisabled } = useInput();

  return (
    <div
      className={
        isDisabled
          ? "relative p-[1px] rounded-md before:content-[''] before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-[length:400%_400%] before:bg-[linear-gradient(115deg,#1bbe84_0%,#331bbe_16%,#be1b55_33%,#a6be1b_55%,#be1b55_67%)] before:animate-[gradient_3s_linear_infinite]"
          : 'border border-border rounded-md overflow-y-auto max-h-96'
      }>
      <div className="relative flex flex-col bg-input rounded-md z-10 ">
        <ChatTopToolbar />
        <ChatTextarea />
        <ChatBottomToolbar />
      </div>
    </div>
  );
};
