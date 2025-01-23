import { SyncProvider } from '../../context/SyncProvider';
import { ChatInputBox } from './ChatInputBox';
import { ChatMessageList } from './ChatMessageList';
import { useInput } from '../../context/InputContext';

export const ChatView = () => {
  const context = useInput();

  return (
    <div className="flex flex-col h-full p-2 pt-0">
      <ChatMessageList />
      <SyncProvider>
        <ChatInputBox context={context} />
      </SyncProvider>
    </div>
  );
};
