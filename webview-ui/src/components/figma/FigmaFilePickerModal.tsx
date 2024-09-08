import React, { useState } from 'react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';

interface FigmaFilePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (figmaSelectionLink: string) => Promise<boolean>;
}

const FigmaFilePickerModal: React.FunctionComponent<FigmaFilePickerModalProps> = ({ open, onClose, onSubmit }) => {
  const [figmaSelectionLink, setFigmaSelectionLink] = useState('');

  async function handleSubmit(): Promise<void> {
    const success = await onSubmit(figmaSelectionLink);
    if (!success) {
      return;
    }

    setFigmaSelectionLink('');
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter the link of Figma selection</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            value={figmaSelectionLink}
            placeholder="https://www.figma.com/design/GAo9lY4bI..."
            onChange={(e) => setFigmaSelectionLink(e.target.value)}
          />

          <Button onClick={handleSubmit} className="w-full">
            Submit
          </Button>

          <p className="text-xs text-neutral-400">
            {'You can copy the link from the Figma selection by right-clicking on the selection and selecting '}
            <span className="font-medium">{'"Copy/Paste as" → "Copy link to selection"'}</span>
          </p>

          <div className="flex-1 h-full w-full min-h-[11rem] figma-copy-selection-example rounded-md overflow-hidden"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { FigmaFilePickerModal };
