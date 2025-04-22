import { EventRequestType } from '../../../../../../shared/protocol'
import { createPreviewPayload } from '../../../../common/utils'

export const useAttachmentPreview = <
  T extends (command: EventRequestType, payload: any) => void
>(
  imageAttachment: string | null | undefined,
  figmaAttachment:
    | { imageUrl: string; fileID: string; nodeID: string }
    | null
    | undefined,
  postMessage: T
) => {
  const handlePreviewAttachment = () => {
    const payload = createPreviewPayload(imageAttachment, figmaAttachment)

    if (payload) {
      postMessage(EventRequestType.OPEN_FILE, payload)
    }
  }

  return handlePreviewAttachment
}
