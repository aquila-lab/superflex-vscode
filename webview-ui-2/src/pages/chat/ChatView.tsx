import { ChatInputBox } from './ChatInputBox';
import { ChatMessageList } from './ChatMessageList';

export const ChatView = () => {
  return (
    <div className="flex flex-col h-full p-2 pt-0 overflow-auto">
      <ChatMessageList />
      <ChatInputBox />
    </div>
  );
};
