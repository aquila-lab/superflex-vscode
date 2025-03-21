import { useCallback } from 'react'
import { Button } from '../../../../../common/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../../../../common/ui/Dialog'
import { useGlobal } from '../../../../layers/global/providers/GlobalProvider'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { useFigmaPremiumModal } from '../../providers/FigmaPremiumModalProvider'

export const FigmaPremiumModal = () => {
  const { config } = useGlobal()
  const { subscribe } = useUser()
  const { isOpen, setIsOpen } = useFigmaPremiumModal()

  const handleSubscribe = useCallback(() => {
    subscribe(
      `https://app.superflex.ai/dashboard/upgrade-subscription?redirect=true&source=${config?.uriScheme}`
    )
    setIsOpen(false)
  }, [subscribe, setIsOpen, config?.uriScheme])

  const handleCloseModal = useCallback(() => setIsOpen(false), [setIsOpen])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleCloseModal}
    >
      <DialogContent className='w-full'>
        <DialogHeader>
          <DialogTitle className='text-left'>
            Upgrade to Access Figma to Code
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Figma integration is a premium feature. Upgrade your plan to connect
          your Figma account and unlock powerful design-to-code capabilities!
        </DialogDescription>
        <DialogFooter className='flex flex-col sm:flex-row sm:justify-start gap-2'>
          <Button onClick={handleSubscribe}>Upgrade to Premium</Button>
          <Button
            variant='secondary'
            onClick={handleCloseModal}
          >
            Back to Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
