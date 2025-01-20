import { FilesProvider } from '../../context/FilesProvider';
import { InputProvider } from '../../context/InputContext';
import { ChatInputBox } from './ChatInputBox';
import { ChatMessageList } from './ChatMessageList';

export const ChatView = () => {
  return (
    <div className="flex flex-col h-full p-2 pt-0">
      <ChatMessageList />
      <FilesProvider>
        <InputProvider>
          <ChatInputBox />
        </InputProvider>
      </FilesProvider>
    </div>
  );
};
