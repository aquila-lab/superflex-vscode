import React from 'react';

import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';

interface PremiumFeatureModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export function PremiumFeatureModal({ title, description, isOpen, onClose, onSubscribe }: PremiumFeatureModalProps) {
  const handleSubscribe = () => {
    onSubscribe();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-left">{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-start gap-2">
          <Button onClick={handleSubscribe}>Upgrade to Premium</Button>
          <Button variant="secondary" onClick={onClose}>
            Continue with Basic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
