import React from 'react';

import { FigmaFile } from '../../../../shared/protocol';
import { ImagePreview } from '../ui/ImagePreview';

interface ChatViewAttachmentProps {
  chatImageAttachment?: File;
  chatFigmaAttachment?: FigmaFile;
  onRemoveAttachment: () => void;
}

const ChatViewAttachment = ({
  chatImageAttachment,
  chatFigmaAttachment,
  onRemoveAttachment
}: ChatViewAttachmentProps) => {
  if (!chatImageAttachment && !chatFigmaAttachment) {
    return null;
  }

  let src: string = '';
  let isLoading: boolean = false;
  if (chatImageAttachment) {
    src = URL.createObjectURL(chatImageAttachment);
    isLoading = false;
  }
  if (chatFigmaAttachment) {
    src = chatFigmaAttachment.imageUrl;
    isLoading = chatFigmaAttachment.isLoading;
  }

  return (
    <div className="flex items-center bg-transparent p-2">
      <ImagePreview
        size="sm"
        spinnerSize="sm"
        alt="preview image"
        src={src}
        isLoading={isLoading}
        onRemove={onRemoveAttachment}
      />
    </div>
  );
};

export default ChatViewAttachment;
