import React from 'react';

import { Progress } from '../ui/Progress';

interface ProjectSyncProgressProps {
  isFirstTimeSync: boolean;
  progress: number;
}

const ProjectSyncProgress: React.FC<ProjectSyncProgressProps> = ({ isFirstTimeSync, progress }) => {
  const syncInProgress = progress !== 100;

  return (
    <div className={syncInProgress ? 'flex flex-col items-center gap-1 mb-4 w-full' : 'hidden'}>
      {isFirstTimeSync ? (
        <p className="text-sm text-primary text-left">
          We are currently indexing your project, which may take a few minutes. During this one-time process, the chat
          feature is temporarily disabled. After indexing is done chat will be available again.
        </p>
      ) : (
        <p className="text-sm text-primary">Updating your project changes...</p>
      )}
      <div className="flex-1 w-full">
        <Progress value={progress} />
      </div>
    </div>
  );
};

export { ProjectSyncProgress };
