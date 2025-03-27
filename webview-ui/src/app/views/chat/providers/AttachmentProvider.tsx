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
  isSelectionDrawerOpen: boolean
  isFigmaLoading: boolean
  imageAttachment: string | null
  figmaAttachment: FigmaAttachment | null
  figmaLink: string
  figmaError: string | null
  setFigmaLink: Dispatch<SetStateAction<string>>
  removeAttachment: () => void
  openSelectionDrawer: () => void
  closeSelectionDrawer: () => void
  submitSelection: () => void
  confirmSelection: () => void
  setImageAttachment: Dispatch<SetStateAction<string | null>>
  submitButtonRef: React.RefObject<HTMLButtonElement | null>
  focusSubmitButton: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  focusInput: () => void
  setFigmaPlaceholderAttachment: Dispatch<
    SetStateAction<FigmaAttachment | null>
  >
  figmaPlaceholderAttachment: FigmaAttachment | null
} | null>(null)

export const AttachmentProvider = ({
  attachment,
  children
}: {
  attachment?: MessageAttachment
  children: ReactNode
}) => {
  const postMessage = usePostMessage()
  const submitButtonRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [isSelectionDrawerOpen, setIsSelectionDrawerOpen] = useState(false)
  const [isFigmaLoading, setIsFigmaLoading] = useState(false)
  const [figmaLink, setFigmaLink] = useState('')
  const [figmaError, setFigmaError] = useState<string | null>(null)
  const [imageAttachment, setImageAttachment] = useState<string | null>(
    attachment?.image ?? null
  )
  const [figmaAttachment, setFigmaAttachment] =
    useState<FigmaAttachment | null>(attachment?.figma ?? null)
  const [figmaPlaceholderAttachment, setFigmaPlaceholderAttachment] =
    useState<FigmaAttachment | null>(null)
  const isAwaitingFigmaAttachment = useRef(false)

  const focusSubmitButton = useCallback(() => {
    queueMicrotask(() => {
      submitButtonRef.current?.focus()
    })
  }, [])

  const focusInput = useCallback(() => {
    queueMicrotask(() => {
      inputRef.current?.focus()
    })
  }, [])

  const openSelectionDrawer = useCallback(() => {
    setFigmaError(null)
    setIsSelectionDrawerOpen(true)
  }, [])

  const closeSelectionDrawer = useCallback(() => {
    setIsSelectionDrawerOpen(false)
    setFigmaLink('')
    setFigmaError(null)
    if (isAwaitingFigmaAttachment.current) {
      setIsFigmaLoading(false)
      isAwaitingFigmaAttachment.current = false
    }
    setFigmaPlaceholderAttachment(null)
  }, [])

  const removeAttachment = useCallback(() => {
    setImageAttachment(null)
    setFigmaAttachment(null)
    setFigmaPlaceholderAttachment(null)
  }, [])

  const submitSelection = useCallback(() => {
    setFigmaError(null)
    postMessage(EventRequestType.CREATE_FIGMA_ATTACHMENT, figmaLink)
    isAwaitingFigmaAttachment.current = true
    setIsFigmaLoading(true)
  }, [postMessage, figmaLink])

  const confirmSelection = useCallback(() => {
    if (figmaPlaceholderAttachment) {
      setFigmaAttachment(figmaPlaceholderAttachment)
      setFigmaPlaceholderAttachment(null)
    }
    closeSelectionDrawer()
  }, [closeSelectionDrawer, figmaPlaceholderAttachment])

  const handleCreateFigmaAttachment = useCallback(
    ({
      payload,
      error
    }: EventResponseMessage<EventResponseType.CREATE_FIGMA_ATTACHMENT>) => {
      if (isAwaitingFigmaAttachment.current) {
        if (!error && payload) {
          setFigmaPlaceholderAttachment(payload)
        } else if (error) {
          setFigmaError(error.message || 'Failed to create Figma attachment')
        }
        setIsFigmaLoading(false)
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
      isSelectionDrawerOpen,
      isFigmaLoading,
      imageAttachment,
      figmaAttachment,
      figmaLink,
      figmaError,
      setFigmaLink,
      removeAttachment,
      openSelectionDrawer,
      closeSelectionDrawer,
      submitSelection,
      confirmSelection,
      setImageAttachment,
      setFigmaPlaceholderAttachment,
      figmaPlaceholderAttachment,
      submitButtonRef,
      focusSubmitButton,
      focusInput,
      inputRef
    }),
    [
      isSelectionDrawerOpen,
      isFigmaLoading,
      imageAttachment,
      figmaAttachment,
      figmaLink,
      figmaError,
      figmaPlaceholderAttachment,
      removeAttachment,
      openSelectionDrawer,
      closeSelectionDrawer,
      submitSelection,
      confirmSelection,
      focusSubmitButton,
      focusInput
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
