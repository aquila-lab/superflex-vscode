import React from 'react';
import { FaFigma } from 'react-icons/fa';
import { cn } from '../../common/utils';

interface FigmaButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const FigmaButton: React.FunctionComponent<FigmaButtonProps> = ({ onClick, disabled }) => {
  return (
    <div className="flex flex-col justify-center h-10">
      <div
        className={cn(
          'flex-initial flex flex-col justify-center items-center rounded-md',
          !disabled && 'hover:bg-muted'
        )}>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'p-1.5 text-muted-foreground',
            disabled ? 'opacity-60' : 'cursor-pointer hover:text-foreground'
          )}
          onClick={onClick}>
          <span className="sr-only">Figma</span>
          <FaFigma className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export { FigmaButton };
