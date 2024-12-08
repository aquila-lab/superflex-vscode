import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface FigmaSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export function FigmaSubscribeModal({ isOpen, onClose, onSubscribe }: FigmaSubscribeModalProps) {
  const handleSubscribe = () => {
    onSubscribe();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-left">Upgrade to Access Figma Integration</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Figma integration is a premium feature. Upgrade your plan to connect your Figma account and unlock powerful
          design-to-code capabilities!
        </DialogDescription>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-start gap-2">
          <Button onClick={handleSubscribe}>Upgrade Now</Button>
          <Button variant="secondary" onClick={onClose}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
