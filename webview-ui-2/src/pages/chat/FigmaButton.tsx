import { useCallback } from 'react';
import { FaFigma } from 'react-icons/fa';
import { cn } from '../../common/utils';
import { Button } from '../../components/ui/Button';
import { useAttachment } from '../../context/AttachmentContext';
import { useGlobal } from '../../context/GlobalContext';
import { usePostMessage } from '../../hooks/usePostMessage';
import { EventRequestType } from '../../../../shared/protocol';

export const FigmaButton = () => {
  const postMessage = usePostMessage();
  const { isFigmaAuthenticated } = useGlobal();
  const { isFigmaLoading, openSelectionModal } = useAttachment();

  const disabled = isFigmaLoading;
  const label = isFigmaAuthenticated ? 'Figma' : 'Connect Figma';

  const handleButtonClicked = useCallback(() => {
    if (isFigmaAuthenticated) {
      openSelectionModal();
      return;
    }

    postMessage(EventRequestType.FIGMA_OAUTH_CONNECT);
  }, [isFigmaAuthenticated, openSelectionModal]);

  return (
    <Button
      size="xs"
      variant="text"
      disabled={disabled}
      className={cn('gap-0.5', disabled && 'opacity-60')}
      onClick={handleButtonClicked}>
      <span className="sr-only">{label}</span>
      <FaFigma className="size-3.5" aria-hidden="true" />
      <span className="hidden xs:block">{label}</span>
    </Button>
  );
};
