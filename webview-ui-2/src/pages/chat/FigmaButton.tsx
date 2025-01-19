import { useCallback } from 'react';
import { FaFigma } from 'react-icons/fa';
import { cn } from '../../common/utils';
import { Button } from '../../components/ui/Button';

export const FigmaButton = () => {
  const isFigmaAuthenticated = false;
  const disabled = true;

  const label = isFigmaAuthenticated ? 'Figma' : 'Connect Figma';

  const handleButtonClicked = useCallback(() => {}, []);

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