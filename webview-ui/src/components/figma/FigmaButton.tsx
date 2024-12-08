import React from 'react';
import { FaFigma } from 'react-icons/fa';

import { cn } from '../../common/utils';
import { useAppSelector } from '../../core/store';
import { Button } from '../ui/Button';

interface FigmaButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const FigmaButton: React.FunctionComponent<FigmaButtonProps> = ({ onClick, disabled }) => {
  const isFigmaAuthenticated = useAppSelector((state) => state.chat.init.isFigmaAuthenticated);

  const label = isFigmaAuthenticated ? 'Figma' : 'Connect Figma';

  return (
    <Button
      size="xs"
      variant="text"
      disabled={disabled}
      className={cn('gap-0.5', disabled && 'opacity-60')}
      onClick={onClick}>
      <span className="sr-only">{label}</span>
      <FaFigma className="size-3.5" aria-hidden="true" />
      <span className="hidden xs:block">{label}</span>
    </Button>
  );
};

export { FigmaButton };
