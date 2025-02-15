import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react'
import type {
  FigmaAttachment,
  MessageAttachment
} from '../../../../../../shared/model'
import {
  EventRequestType,
  type EventResponseMessage,
  EventResponseType
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../../../layers/global/hooks/useConsumeMessage'
import { usePostMessage } from '../../../layers/global/hooks/usePostMessage'

const AttachmentContext = createContext<{
  isSelectionModalOpen: boolean
  isFigmaLoading: boolean
  imageAttachment: string | null
  figmaAttachment: FigmaAttachment | null
  figmaLink: string
  setFigmaLink: Dispatch<SetStateAction<string>>
  removeAttachment: () => void
  openSelectionModal: () => void
  closeSelectionModal: () => void
  submitSelection: () => void
  setImageAttachment: Dispatch<SetStateAction<string | null>>
} | null>(null)

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
  const isAwaitingFigmaAttachment = useRef(false)

  const openSelectionModal = useCallback(() => {
    setIsSelectionModalOpen(true)
  }, [])

  const closeSelectionModal = useCallback(() => {
    setIsSelectionModalOpen(false)
  }, [])

  const removeAttachment = useCallback(() => {
    setImageAttachment(null)
    setFigmaAttachment(null)
  }, [])

  const submitSelection = useCallback(() => {
    postMessage(EventRequestType.CREATE_FIGMA_ATTACHMENT, figmaLink)
    isAwaitingFigmaAttachment.current = true
    removeAttachment()
    setIsFigmaLoading(true)
    closeSelectionModal()
  }, [postMessage, figmaLink, closeSelectionModal, removeAttachment])

  const handleCreateFigmaAttachment = useCallback(
    ({
      payload,
      error
    }: EventResponseMessage<EventResponseType.CREATE_FIGMA_ATTACHMENT>) => {
      if (isAwaitingFigmaAttachment.current) {
        if (!error && payload) {
          setFigmaAttachment(payload)
        }
        setFigmaLink('')
        setIsFigmaLoading(false)
        isAwaitingFigmaAttachment.current = false
      }
    },
    []
  )

  useConsumeMessage(
    EventResponseType.CREATE_FIGMA_ATTACHMENT,
    handleCreateFigmaAttachment
  )

  const value = useMemo(
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
      submitSelection,
      setImageAttachment
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
