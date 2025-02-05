import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import type { FigmaAttachment, MessageAttachment } from '../../../shared/model'
import {
  EventRequestType,
  type EventResponseMessage,
  EventResponseType
} from '../../../shared/protocol'
import { useConsumeMessage } from '../hooks/useConsumeMessage'
import { usePostMessage } from '../hooks/usePostMessage'

interface AttachmentContextValue {
  isSelectionModalOpen: boolean
  isFigmaLoading: boolean
  imageAttachment: string | null
  figmaAttachment: FigmaAttachment | null
  figmaLink: string
  setFigmaLink: React.Dispatch<React.SetStateAction<string>>
  removeAttachment: () => void
  openSelectionModal: () => void
  closeSelectionModal: () => void
  submitSelection: () => void
}

const AttachmentContext = createContext<AttachmentContextValue | null>(null)

export const AttachmentProvider = ({
  attachment,
  children
}: {
  attachment?: MessageAttachment
  children: ReactNode
}) => {
  const postMessage = usePostMessage()

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false)
  const [isFigmaLoading, setIsFigmaLoading] = useState(false)
  const [figmaLink, setFigmaLink] = useState('')
  const [imageAttachment, setImageAttachment] = useState<string | null>(
    attachment?.image ?? null
  )
  const [figmaAttachment, setFigmaAttachment] =
    useState<FigmaAttachment | null>(attachment?.figma ?? null)

  const openSelectionModal = useCallback(() => {
    setIsSelectionModalOpen(true)
  }, [])

  const closeSelectionModal = useCallback(() => {
    setIsSelectionModalOpen(false)
  }, [])

  const submitSelection = useCallback(() => {
    postMessage(EventRequestType.CREATE_FIGMA_ATTACHMENT, figmaLink)
    setImageAttachment(null)
    setIsFigmaLoading(true)
    closeSelectionModal()
  }, [postMessage, figmaLink, closeSelectionModal])

  const removeAttachment = useCallback(() => {
    setImageAttachment(null)
    setFigmaAttachment(null)
  }, [])

  const handleCreateFigmaAttachment = useCallback(
    ({
      payload
    }: EventResponseMessage<EventResponseType.CREATE_FIGMA_ATTACHMENT>) => {
      setFigmaAttachment(payload)
      setIsFigmaLoading(false)
      setFigmaLink('')
    },
    []
  )

  useConsumeMessage(
    EventResponseType.CREATE_FIGMA_ATTACHMENT,
    handleCreateFigmaAttachment
  )

  const value: AttachmentContextValue = useMemo(
    () => ({
      isSelectionModalOpen,
      isFigmaLoading,
      imageAttachment,
      figmaAttachment,
      figmaLink,
      setFigmaLink,
      removeAttachment,
      openSelectionModal,
      closeSelectionModal,
      submitSelection
    }),
    [
      isSelectionModalOpen,
      isFigmaLoading,
      imageAttachment,
      figmaAttachment,
      figmaLink,
      removeAttachment,
      openSelectionModal,
      closeSelectionModal,
      submitSelection
    ]
  )

  return (
    <AttachmentContext.Provider value={value}>
      {children}
    </AttachmentContext.Provider>
  )
}

export function useAttachment() {
  const context = useContext(AttachmentContext)

  if (!context) {
    throw new Error('Attachment context provider not set')
  }

  return context
}
