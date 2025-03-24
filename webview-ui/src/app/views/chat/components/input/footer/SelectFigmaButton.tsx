import { useCallback } from 'react'
import { FaFigma } from 'react-icons/fa'
import { Button } from '../../../../../../common/ui/Button'
import { cn } from '../../../../../../common/utils'
import { useNewMessage } from '../../../../../layers/authenticated/providers/NewMessageProvider'
import { useUser } from '../../../../../layers/authenticated/providers/UserProvider'
import { useGlobal } from '../../../../../layers/global/providers/GlobalProvider'
import { useAttachment } from '../../../providers/AttachmentProvider'
import { useFigmaPremiumModal } from '../../../providers/FigmaPremiumModalProvider'

export const SelectFigmaButton = () => {
  const { isFigmaAuthenticated, connectFigma } = useGlobal()
  const { isFigmaLoading, openSelectionDrawer } = useAttachment()
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
      openSelectionDrawer()
      return
    }

    connectFigma()
  }, [
    isFigmaAuthenticated,
    openSelectionDrawer,
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
      <FaFigma
        className='size-3.5'
        aria-hidden='true'
      />
      <span className='hidden xs:block'>{label}</span>
    </Button>
  )
}
