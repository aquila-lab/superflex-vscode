import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface FeedbackDialogProps {
  onFeedback: (feedback: string) => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ onFeedback }) => {
  const [confirmationVisible, setConfirmationVisible] = useState(false);

  const handleFeedback = (feedback: string) => {
    onFeedback(feedback);
    setConfirmationVisible(true);
  };

  return (
    <div className="flex flex-row justify-center items-center gap-4">
      {!confirmationVisible ? (
        <>
          <span className="text-xs">Was this generation useful?</span>
          <div className="flex gap-2">
            <Button size="xs" variant={'outline'} onClick={() => handleFeedback('yes')}>
              👍 Yes
            </Button>
            <Button size="xs" variant={'outline'} onClick={() => handleFeedback('no')}>
              👎 No - Improve it
            </Button>
          </div>
        </>
      ) : (
        <p className="text-xs p-[5px]">Thank you for your feedback!</p>
      )}
    </div>
  );
};

export default FeedbackDialog;
