import { useCallback, useMemo } from "react";
import { useAttachment } from "../../context/AttachmentContext";
import { useEditMode } from "../../context/EditModeContext";
import { ImagePreview } from "./ImagePreview";

export const ChatAttachment = () => {
	const { imageAttachment, figmaAttachment, isFigmaLoading, removeAttachment } =
		useAttachment();

	const { isEditMode } = useEditMode();

	const handleRemoveAttachment = useCallback(
		() => removeAttachment(),
		[removeAttachment],
	);

	const src = useMemo(
		() => figmaAttachment?.imageUrl || imageAttachment || "",
		[figmaAttachment, imageAttachment],
	);

	if (!(imageAttachment || figmaAttachment || isFigmaLoading)) {
		return null;
	}

	return (
		<div className="flex items-center bg-transparent p-2">
			<ImagePreview
				size="sm"
				spinnerSize="sm"
				alt="preview image"
				src={src}
				isLoading={isFigmaLoading}
				{...(isEditMode && { onRemove: handleRemoveAttachment })}
			/>
		</div>
	);
};
