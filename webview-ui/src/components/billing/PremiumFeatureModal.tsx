import React from 'react';

import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/Dialog';

interface PremiumFeatureModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (link?: string) => void;
}

export function PremiumFeatureModal({ title, description, isOpen, onClose, onSubscribe }: PremiumFeatureModalProps) {
  const handleSubscribe = () => {
    onSubscribe();
    onClose();
  };

  const handleChatWithFounder = () => {
    onSubscribe('https://calendly.com/yegemberdin/quick-chat-w-aibek');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle className="text-left">{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {description}
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm">
              🎉 <span className="font-semibold">Special Offer:</span> Chat with our co-founder and get 1 month of
              Individual Pro Plan for free!
            </p>
          </div>
        </DialogDescription>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-start gap-2">
          <Button onClick={handleSubscribe}>Upgrade to Premium</Button>
          <Button variant="secondary" onClick={handleChatWithFounder}>
            Chat for Free Trial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
