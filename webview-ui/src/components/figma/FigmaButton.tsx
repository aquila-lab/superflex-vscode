import React from 'react';
import { FaFigma } from 'react-icons/fa';
import { cn } from '../../common/utils';

interface FigmaButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const FigmaButton: React.FunctionComponent<FigmaButtonProps> = ({ onClick, disabled }) => {
  return (
    <div className="flex flex-col justify-center">
      <div className="flex-initial flex flex-col justify-center items-center rounded-md">
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex items-center gap-0.5 p-1.5 text-muted-foreground',
            disabled ? 'opacity-60' : 'cursor-pointer hover:text-foreground'
          )}
          onClick={onClick}>
          <span className="sr-only">Figma</span>
          <FaFigma className="size-3.5" aria-hidden="true" />
          <span className="text-xs">Figma</span>
        </button>
      </div>
    </div>
  );
};

export { FigmaButton };
