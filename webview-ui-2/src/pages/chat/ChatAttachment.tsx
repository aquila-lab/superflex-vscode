import { useCallback } from 'react';
import { useAttachment } from '../../context/AttachmentContext';
import { ImagePreview } from './ImagePreview';

export const ChatAttachment = () => {
  const { imageAttachment, figmaAttachment, isFigmaLoading, removeAttachment } = useAttachment();

  const handleRemoveAttachment = useCallback(() => removeAttachment(), [removeAttachment]);

  if (!imageAttachment && !figmaAttachment && !isFigmaLoading) {
    return null;
  }

  let src = '';

  if (imageAttachment) {
    src = URL.createObjectURL(imageAttachment);
  }

  if (figmaAttachment) {
    src = figmaAttachment.imageUrl;
  }

  return (
    <div className="flex items-center bg-transparent p-2">
      <ImagePreview
        size="sm"
        spinnerSize="sm"
        alt="preview image"
        src={src}
        isLoading={isFigmaLoading}
        onRemove={handleRemoveAttachment}
      />
    </div>
  );
};
