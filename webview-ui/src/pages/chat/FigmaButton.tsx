import { useCallback } from 'react'
import { FaFigma } from 'react-icons/fa'
import { cn } from '../../common/utils'
import { Button } from '../../components/ui/Button'
import { useAttachment } from '../../context/AttachmentContext'
import { useGlobal } from '../../context/GlobalContext'
import { useNewMessage } from '../../context/NewMessageContext'
import { useUser } from '../../context/UserContext'
import { useFigmaPremiumModal } from '../../context/FigmaPremiumModalContext'

export const FigmaButton = () => {
  const { isFigmaAuthenticated, connectFigma } = useGlobal()
  const { isFigmaLoading, openSelectionModal } = useAttachment()
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()
  const { setIsOpen } = useFigmaPremiumModal()
  const { subscription } = useUser()

  const isDisabled = isFigmaLoading || isMessageProcessing || isMessageStreaming
  const label = isFigmaAuthenticated ? 'Figma' : 'Connect Figma'

  const handleButtonClicked = useCallback(() => {
    if (subscription?.plan?.name.toLowerCase().includes('free')) {
      setIsOpen(true)
      return
    }

    if (isFigmaAuthenticated) {
      openSelectionModal()
      return
    }

    connectFigma()
  }, [
    isFigmaAuthenticated,
    openSelectionModal,
    connectFigma,
    setIsOpen,
    subscription
  ])

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
