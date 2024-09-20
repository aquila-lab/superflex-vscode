import React from 'react';
import { FaFigma } from 'react-icons/fa';
import { cn } from '../../common/utils';
import { Button } from '../ui/Button';

interface FigmaButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const FigmaButton: React.FunctionComponent<FigmaButtonProps> = ({ onClick, disabled }) => {
  return (
    <Button
      size="xs"
      variant="text"
      disabled={disabled}
      className={cn('gap-0.5', disabled && 'opacity-60')}
      onClick={onClick}>
      <span className="sr-only">Figma</span>
      <FaFigma className="size-3.5" aria-hidden="true" />
      <span>Figma</span>
    </Button>
  );
};

export { FigmaButton };
