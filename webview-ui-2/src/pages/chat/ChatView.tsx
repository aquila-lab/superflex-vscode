import { InputProvider } from '../../context/InputContext';
import { SyncProvider } from '../../context/SyncProvider';
import { ChatInputBox } from './ChatInputBox';
import { ChatMessageList } from './ChatMessageList';

export const ChatView = () => {
  return (
    <div className="flex flex-col h-full p-2 pt-0">
      <ChatMessageList />
      <SyncProvider>
        <InputProvider>
          <ChatInputBox />
        </InputProvider>
      </SyncProvider>
    </div>
  );
};
