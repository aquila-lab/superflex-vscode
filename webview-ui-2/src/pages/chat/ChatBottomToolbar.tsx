import { useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { FigmaButton } from './FigmaButton';
import { FilePicker } from './FilePicker';
import { IoIosReturnLeft } from 'react-icons/io';
import { TrashIcon } from '@radix-ui/react-icons';
import { InputContextValue } from '../../common/utils';
import { useNewMessage } from '../../context/NewMessageContext';
import { useAttachment } from '../../context/AttachmentContext';

export const ChatBottomToolbar = ({ context, messageId }: { context: InputContextValue; messageId?: string }) => {
  const { isDisabled, input, stopMessage, setInput } = context;
  const { sendMessageContent } = useNewMessage();
  const { figmaAttachment, removeAttachment } = useAttachment();

  const handleMessageStopped = useCallback(() => {
    stopMessage();
  }, [stopMessage]);

  const handleButtonClicked = useCallback(() => {
    console.log(input);
    console.log(figmaAttachment);
    sendMessageContent({
      text: input,
      attachment: figmaAttachment
        ? {
            figma: figmaAttachment
          }
        : undefined,
      fromMessageID: messageId
    });
    setInput('');
    removeAttachment();
  }, [messageId, figmaAttachment, input, sendMessageContent, setInput, removeAttachment]);

  return (
    <div className="flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2">
      <div className="flex flex-row items-center gap-1">
        <FigmaButton />
        <FilePicker />
      </div>

      <div className="flex flex-row items-center gap-1">
        {!isDisabled && (
          <Button
            size="xs"
            variant="text"
            active={!isDisabled && (input.length > 0 || figmaAttachment) ? 'active' : 'none'}
            disabled={isDisabled || (!input.length && !figmaAttachment)}
            className={isDisabled ? 'opacity-60' : ''}
            onClick={handleButtonClicked}>
            <span className="sr-only">Enter</span>
            <IoIosReturnLeft className="size-4" aria-hidden="true" />
            <span>send</span>
          </Button>
        )}
        {isDisabled && (
          <Button
            size="xs"
            variant="text"
            className="text-[11px] px-1 py-0 hover:bg-muted"
            onClick={handleMessageStopped}>
            <TrashIcon className="size-3.5" />
            Stop
          </Button>
        )}
      </div>
    </div>
  );
};
