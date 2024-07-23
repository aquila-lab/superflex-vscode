import React from 'react';
import { FaFigma } from 'react-icons/fa';

interface FigmaButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const FigmaButton = ({ onClick, disabled }: FigmaButtonProps): JSX.Element => {
  return (
    <div className="flex flex-col justify-center h-10">
      <div
        className={`flex-initial flex flex-col justify-center items-center rounded-md ${
          !disabled && 'hover:bg-neutral-700'
        }`}>
        <button
          type="button"
          className={`p-1.5 ${disabled ? 'text-neutral-500' : 'cursor-pointer text-neutral-400'}`}
          onClick={onClick}>
          <span className="sr-only">Figma</span>
          <FaFigma className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default FigmaButton;
