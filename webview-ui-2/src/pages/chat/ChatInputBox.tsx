import { Message, Role } from '../../../../shared/model';
import { AttachmentProvider } from '../../context/AttachmentContext';
import { useEditMode } from '../../context/EditModeContext';
import { FilesProvider } from '../../context/FilesProvider';
import { InputProvider } from '../../context/InputContext';
import { ChatAttachment } from './ChatAttachment';
import { ChatBottomToolbar } from './ChatBottomToolbar';
import { ChatInputBoxContainer } from './ChatInputBoxContainer';
import { ChatMessageHeader } from './ChatMessageHeader';
import { ChatTextarea } from './ChatTextarea';
import { ChatTopToolbar } from './ChatTopToolbar';
import { FigmaSelectionModal } from './FigmaSelectionModal';
import { FilePreview } from './FilePreview';
import { useUser } from '../../context/UserContext';
import { ChatMessageContainer } from './ChatMessageContainer';

export const ChatInputBox = ({ message }: { message?: Message }) => {
  const { isEditMode, isDraft } = useEditMode();
  const { user } = useUser();

  return (
    <AttachmentProvider attachment={message?.content.attachment}>
      <ChatAttachment />

      <InputProvider text={message?.content.text}>
        <ChatInputBoxContainer>
          <FilesProvider files={message?.content.files}>
            <FilePreview />
            <ChatTopToolbar />
            {!isEditMode && (
              <ChatMessageContainer role={Role.User}>
                <ChatMessageHeader
                  role={Role.User}
                  picture={user?.picture ?? ''}
                  username={user?.username}
                  isDraft={isDraft}
                />
              </ChatMessageContainer>
            )}
            <ChatTextarea />
            <ChatBottomToolbar />
          </FilesProvider>
        </ChatInputBoxContainer>
      </InputProvider>

      <FigmaSelectionModal />
    </AttachmentProvider>
  );
};
