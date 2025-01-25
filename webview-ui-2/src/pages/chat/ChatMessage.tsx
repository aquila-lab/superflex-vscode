import { Message, MessageType, Role } from '../../../../shared/model';
import { areMessagePropsEqual } from '../../common/utils';
import { useUser } from '../../context/UserContext';
import { memo, useCallback, useContext, useMemo } from 'react';
import { ChatMessageHeader } from './ChatMessageHeader';
import { ChatMessageContainer } from './ChatMessageContainer';
import { MarkdownRender } from './MarkdownRender';
import { ChatInputBox } from './ChatInputBox';
import { EditModeContext } from '../../context/EditModeContext';
import { useEditInput } from '../../context/EditInputContext';

const ChatMessageComponent = ({ message }: { message: Message }) => {
  const { user } = useUser();
  const editModeContext = useContext(EditModeContext);
  const context = useEditInput();
  
  if (!user) return null;

  const textContent = useMemo(() => {
    if (message.content.type === MessageType.Text) {
      return message.content.text;
    } else if (message.content.type === MessageType.TextDelta) {
      return message.content.value;
    } else {
      return '';
    }
  }, [message, message.content]);

  const handleMessageClicked = useCallback(() => {
    if (editModeContext) {
      editModeContext.setIsEditMode(true);
      context.setInput(textContent);
    }
  }, [editModeContext, editModeContext?.setIsEditMode, context]);

  switch (message.role) {
    case Role.User:
      return (
        <div onClick={handleMessageClicked}>
          {editModeContext?.isEditMode && message.role === Role.User ? (
            <ChatInputBox context={context} />
          ) : (
            <ChatMessageContainer role={message.role}>
              {/* <ImagePreview alt="preview image" className="mt-2" src={message.content.image} />; */}
              <ChatMessageHeader role={message.role} picture={user.picture} username={user.username} />
              <MarkdownRender role={message.role}>{textContent}</MarkdownRender>
            </ChatMessageContainer>
          )}
        </div>
      );
    case Role.Assistant:
      return (
        <ChatMessageContainer role={message.role}>
          <ChatMessageHeader role={message.role} picture={user.picture} username={user.username} />
          <MarkdownRender role={message.role}>{textContent}</MarkdownRender>
        </ChatMessageContainer>
      );
  }
};

export const ChatMessage = memo(ChatMessageComponent, areMessagePropsEqual);
