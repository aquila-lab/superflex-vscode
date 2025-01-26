import { InputContextValue } from '../../common/utils';
import { FilesProvider } from '../../context/FilesProvider';
import { ChatBottomToolbar } from './ChatBottomToolbar';
import { ChatInputBoxContainer } from './ChatInputBoxContainer';
import { ChatTextarea } from './ChatTextarea';
import { ChatTopToolbar } from './ChatTopToolbar';
import { FilePreview } from './FilePreview';

export const ChatInputBox = ({ context, messageId }: { context: InputContextValue, messageId?: string }) => {
  return (
    <ChatInputBoxContainer context={context} messageId={messageId}>
      <FilesProvider>
        <FilePreview />
        <ChatTopToolbar />
      </FilesProvider>
      <ChatTextarea context={context} messageId={messageId} />
      <ChatBottomToolbar context={context} messageId={messageId} />
    </ChatInputBoxContainer>
  );
};
