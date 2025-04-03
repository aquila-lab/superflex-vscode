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
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { useGlobal } from '../../../../layers/global/providers/GlobalProvider'
import { useFigmaPremiumModal } from '../../providers/FigmaPremiumModalProvider'
import { MAX_FREE_NODES } from '../../../../../common/utils'

export const FigmaPremiumModal = () => {
  const { config } = useGlobal()
  const { subscribe } = useUser()
  const { isOpen, setIsOpen, onContinue } = useFigmaPremiumModal()
  const { isFigmaAuthenticated } = useGlobal()

  const handleSubscribe = useCallback(() => {
    subscribe(
      `https://app.superflex.ai/dashboard/upgrade-subscription?redirect=true&source=${config?.uriScheme}`
    )
    setIsOpen(false)
  }, [subscribe, setIsOpen, config?.uriScheme])

  const handleContinue = useCallback(() => {
    setIsOpen(false)

    if (onContinue) {
      onContinue(!!isFigmaAuthenticated)
    }
  }, [setIsOpen, isFigmaAuthenticated, onContinue])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent className='w-full'>
        <DialogHeader>
          <DialogTitle className='text-left'>
            Limited Figma Access on Free Plan
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className='space-y-2'>
          <p>
            Your free plan includes limited Figma access with the following
            restrictions:
          </p>
          <ul className='list-disc pl-5'>
            <li>1 free Figma request</li>
            <li>Maximum {MAX_FREE_NODES} nodes per request</li>
            <li>Slow response times</li>
          </ul>
          <p className='mt-2'>
            Upgrade to Premium for unlimited Figma integration and more powerful
            design-to-code capabilities!
          </p>
        </DialogDescription>
        <DialogFooter className='flex flex-col sm:flex-row sm:justify-start gap-2'>
          <Button onClick={handleSubscribe}>Upgrade to Premium</Button>
          <Button
            variant='secondary'
            onClick={handleContinue}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
