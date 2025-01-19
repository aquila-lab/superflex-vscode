import { useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { useInput } from '../../context/InputContext';
import { FigmaButton } from './FigmaButton';
import { FilePicker } from './FilePicker';
import { IoIosReturnLeft } from 'react-icons/io';

export const ChatBottomToolbar = () => {
  const { isDisabled, input, sendUserMessage } = useInput();

  const handleButtonClicked = useCallback(() => {
    sendUserMessage();
  }, [sendUserMessage]);

  return (
    <div className="flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2">
      <div className="flex flex-row items-center gap-1">
        <FigmaButton />
        <FilePicker />
      </div>

      <div className="flex flex-row items-center gap-1">
        <Button
          size="xs"
          variant="text"
          active={!isDisabled && input.length > 0 ? 'active' : 'none'}
          disabled={isDisabled}
          className={isDisabled ? 'opacity-60' : ''}
          onClick={handleButtonClicked}>
          <span className="sr-only">Enter</span>
          <IoIosReturnLeft className="size-4" aria-hidden="true" />
          <span>send</span>
        </Button>
      </div>
    </div>
  );
};
