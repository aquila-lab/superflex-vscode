import React from 'react';

import { Progress } from '../ui/Progress';

interface ProjectSyncProgressProps {
  progress: number;
}

const ProjectSyncProgress: React.FC<ProjectSyncProgressProps> = ({ progress }) => {
  const syncInProgress = progress !== 100;

  return (
    <div className={syncInProgress ? 'flex flex-col items-center gap-1 mb-4 w-full' : 'hidden'}>
      <p className="text-sm text-primary">Project syncing in progress...</p>
      <div className="flex-1 w-full">
        <Progress value={progress} />
      </div>
    </div>
  );
};

export { ProjectSyncProgress };
