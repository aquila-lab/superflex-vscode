import React, { useState } from 'react';

import { FilePayload } from '../../../../shared/protocol';
import { useAppDispatch, useAppSelector } from '../../core/store';
import { setSelectedFiles } from '../../core/chat/chatSlice';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';

interface FigmaFilePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (selectedFiles: FilePayload[], figmaSelectionLink: string) => Promise<boolean>;
}

const FigmaFilePickerModal: React.FunctionComponent<FigmaFilePickerModalProps> = ({ open, onClose, onSubmit }) => {
  const dispatch = useAppDispatch();

  const selectedFiles = useAppSelector((state) => state.chat.selectedFiles);

  const [figmaSelectionLink, setFigmaSelectionLink] = useState('');

  async function handleSubmit(): Promise<void> {
    const success = await onSubmit(selectedFiles, figmaSelectionLink);
    if (!success) {
      return;
    }

    setFigmaSelectionLink('');
    dispatch(setSelectedFiles(selectedFiles.filter((f) => f.isCurrentOpenFile)));
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

          <p className="text-xs text-muted-foreground">
            {'You can copy the link from the Figma selection by right-clicking on the selection and selecting '}
            <span className="font-medium">{'"Copy/Paste as" → "Copy link to selection"'}</span>
          </p>

          {/* DO NOT REMOVE THIS DIV: it's used to display the image of Figma selection example */}
          <div className="flex-1 h-full w-full min-h-[11rem] figma-copy-selection-example rounded-md overflow-hidden"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { FigmaFilePickerModal };
