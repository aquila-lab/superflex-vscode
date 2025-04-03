import { useCallback, useMemo } from 'react'
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
  const { isFigmaLoading, openSelectionDrawer, focusInput } = useAttachment()
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()
  const { subscription } = useUser()
  const { setIsOpen, setOnContinue } = useFigmaPremiumModal()
  const { fetchSubscription, fetchUserInfo } = useUser()

  const isFreePlan = useMemo(
    () => subscription?.plan?.name.toLowerCase().includes('free'),
    [subscription]
  )

  const isDisabled = useMemo(
    () => isFigmaLoading || isMessageProcessing || isMessageStreaming,
    [isFigmaLoading, isMessageProcessing, isMessageStreaming]
  )

  const label = useMemo(
    () => (isFigmaAuthenticated ? 'Figma' : 'Connect Figma'),
    [isFigmaAuthenticated]
  )

  const handleFigmaAction = useCallback(
    (isAuthenticated: boolean) => {
      if (isAuthenticated) {
        if (isFreePlan) {
          fetchSubscription()
          fetchUserInfo()
        }

        openSelectionDrawer()
        focusInput()
      } else {
        connectFigma()
      }
    },
    [
      openSelectionDrawer,
      focusInput,
      connectFigma,
      fetchSubscription,
      fetchUserInfo,
      isFreePlan
    ]
  )

  const handleButtonClicked = useCallback(() => {
    if (isFreePlan) {
      setOnContinue(() => handleFigmaAction)
      setIsOpen(true)
      return
    }

    handleFigmaAction(!!isFigmaAuthenticated)
  }, [
    isFigmaAuthenticated,
    handleFigmaAction,
    isFreePlan,
    setIsOpen,
    setOnContinue
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
