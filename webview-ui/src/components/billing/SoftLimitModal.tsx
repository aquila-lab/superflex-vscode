import React from 'react';

import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';

interface SoftLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export function SoftLimitModal({ isOpen, onClose, onSubscribe }: SoftLimitModalProps) {
  const handleSubscribe = () => {
    onSubscribe();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-left">Premium Requests Exhausted</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          You&apos;ve used all your premium requests. Subscribe for unlimited access or continue with free requests!
        </DialogDescription>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-start gap-2">
          <Button onClick={handleSubscribe}>Subscribe Now</Button>
          <Button variant="secondary" onClick={onClose}>
            Continue with Free
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
