import { ChatBottomToolbar } from './ChatBottomToolbar';
import { ChatInputBoxContainer } from './ChatInputBoxContainer';
import { ChatTextarea } from './ChatTextarea';
import { ChatTopToolbar } from './ChatTopToolbar';
import { FilePreview } from './FilePreview';

export const ChatInputBox = () => {
  return (
    <ChatInputBoxContainer>
      <FilePreview />
      <ChatTopToolbar />
      <ChatTextarea />
      <ChatBottomToolbar />
    </ChatInputBoxContainer>
  );
};
