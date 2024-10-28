import React from 'react';

import { Button } from '../ui/Button';

interface OutOfRequestsPageProps {
  onSubscribe: () => void;
}

export const OutOfRequestsPage: React.FC<OutOfRequestsPageProps> = ({ onSubscribe }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-4 h-full ">
      <p className="text-2xl font-bold">Out of Free Requests</p>
      <p>
        You have used all your free requests for this month. Subscribe now to continue using the service without
        interruptions.
      </p>
      <Button onClick={onSubscribe}>Subscribe Now</Button>
    </div>
  );
};
