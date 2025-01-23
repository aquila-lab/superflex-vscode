import { InputContextValue } from '../../common/utils';
import { FilesProvider } from '../../context/FilesProvider';
import { ChatBottomToolbar } from './ChatBottomToolbar';
import { ChatInputBoxContainer } from './ChatInputBoxContainer';
import { ChatTextarea } from './ChatTextarea';
import { ChatTopToolbar } from './ChatTopToolbar';
import { FilePreview } from './FilePreview';

export const ChatInputBox = ({ context }: { context: InputContextValue }) => {
  return (
    <ChatInputBoxContainer context={context}>
      <FilesProvider>
        <FilePreview />
        <ChatTopToolbar />
      </FilesProvider>
      <ChatTextarea context={context} />
      <ChatBottomToolbar context={context} />
    </ChatInputBoxContainer>
  );
};
