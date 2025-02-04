import { ChatInputBox } from './ChatInputBox';
import { ChatMessageList } from './ChatMessageList';
import { useInput } from '../../context/InputContext';
import { FigmaSelectionModal } from './FigmaSelectionModal';
import { ChatAttachment } from './ChatAttachment';

export const ChatView = () => {
  const context = useInput();

  return (
    <>
      <div className="flex flex-col h-full p-2 pt-0 overflow-auto">
        <ChatMessageList />
        <ChatAttachment />
        <ChatInputBox context={context} />
      </div>

      <FigmaSelectionModal />
    </>
  );
};
