import React from 'react';

interface LoadingDotsProps {
  isLoading: boolean;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ isLoading }) => {
  return (
    <div className={isLoading ? 'flex items-center gap-x-1' : 'hidden'}>
      <span className="sr-only">Loading...</span>
      <div className="size-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="size-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="size-1 bg-muted-foreground rounded-full animate-bounce"></div>
    </div>
  );
};

export { LoadingDots };
