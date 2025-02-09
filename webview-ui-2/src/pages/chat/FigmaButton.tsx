import { useCallback } from 'react'
import { FaFigma } from 'react-icons/fa'
import { EventRequestType } from '../../../../shared/protocol'
import { cn } from '../../common/utils'
import { Button } from '../../components/ui/Button'
import { useAttachment } from '../../context/AttachmentContext'
import { useGlobal } from '../../context/GlobalContext'
import { usePostMessage } from '../../hooks/usePostMessage'
import { useNewMessage } from '../../context/NewMessageContext'

export const FigmaButton = () => {
  const postMessage = usePostMessage()
  const { isFigmaAuthenticated } = useGlobal()
  const { isFigmaLoading, openSelectionModal } = useAttachment()
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()

  const isDisabled = isFigmaLoading || isMessageProcessing || isMessageStreaming
  const label = isFigmaAuthenticated ? 'Figma' : 'Connect Figma'

  const handleButtonClicked = useCallback(() => {
    if (isFigmaAuthenticated) {
      openSelectionModal()
      return
    }

    postMessage(EventRequestType.FIGMA_OAUTH_CONNECT)
  }, [isFigmaAuthenticated, openSelectionModal, postMessage])

  return (
    <Button
      size='xs'
      variant='text'
      disabled={isDisabled}
      className={cn('gap-0.5', isDisabled && 'opacity-60')}
      onClick={handleButtonClicked}
    >
      <span className='sr-only'>{label}</span>
      <FaFigma className='size-3.5' aria-hidden='true' />
      <span className='hidden xs:block'>{label}</span>
    </Button>
  )
}
