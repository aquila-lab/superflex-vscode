import React, { useState } from 'react';

import Modal from '../ui/Dialog';
import { Button } from '../ui/Button';

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
    <Modal isOpen={open} onClose={onClose} title="Enter the link of Figma selection">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={figmaSelectionLink}
          placeholder="https://www.figma.com/design/GAo9lY4bI..."
          className="w-full p-2 bg-neutral-700 text-white rounded-md focus:outline-none"
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
    </Modal>
  );
};

export { FigmaFilePickerModal };
