import { ChatInputBox } from './ChatInputBox';
import { ChatMessageList } from './ChatMessageList';

export const ChatView = () => {
  return (
    <>
      <ChatMessageList />
      <ChatInputBox />
    </>
  );
};
