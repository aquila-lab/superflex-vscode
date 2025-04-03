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
import { useFigmaFreePlanLimits } from '../../hooks/useFigmaFreePlanLimits'
import { MAX_FREE_NODES } from '../../../../../common/utils'
import { Badge } from '../../../../../common/ui/Badge'
import { CircleIcon } from '@radix-ui/react-icons'

export const FigmaPremiumModal = () => {
  const { config } = useGlobal()
  const { subscribe } = useUser()
  const { isOpen, setIsOpen, onContinue } = useFigmaPremiumModal()
  const { isFigmaAuthenticated } = useGlobal()
  const { hasReachedFigmaRequestLimit, figmaLimits } = useFigmaFreePlanLimits()

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

  const remainingRequests = figmaLimits.maxRequests - figmaLimits.requestsUsed
  const continueButtonText = isFigmaAuthenticated ? 'Continue' : 'Connect Figma'
  const showContinueButton = !hasReachedFigmaRequestLimit

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
        <DialogDescription>
          {hasReachedFigmaRequestLimit ? (
            <div className='mb-4'>
              <Badge
                variant='destructive'
                className='mb-2'
              >
                No requests remaining
              </Badge>
              <p className='text-xs text-muted-foreground'>
                You have used your free Figma request for this billing period.
                Upgrade to Premium for unlimited Figma requests.
              </p>
            </div>
          ) : (
            <div>
              <Badge variant='destructive'>
                {remainingRequests}{' '}
                {remainingRequests === 1 ? 'request' : 'requests'} remaining
              </Badge>
              <p className='text-xs text-muted-foreground mt-4'>
                Your free plan includes limited Figma access with the following
                restrictions:
              </p>
              <ul className='text-foreground mt-2'>
                <li className='flex items-center gap-2'>
                  <CircleIcon className='w-1 h-1' /> {figmaLimits.maxRequests}{' '}
                  free {figmaLimits.maxRequests === 1 ? 'request' : 'requests'}{' '}
                  per billing period
                </li>
                <li className='flex items-center gap-2'>
                  <CircleIcon className='w-1 h-1' /> Maximum {MAX_FREE_NODES}{' '}
                  nodes per request
                </li>
                <li className='flex items-center gap-2'>
                  <CircleIcon className='w-1 h-1' /> Slow response times
                </li>
              </ul>
            </div>
          )}
          <p className='text-xs text-muted-foreground mt-2'>
            Upgrade to Premium for unlimited Figma integration and more powerful
            design-to-code capabilities!
          </p>
        </DialogDescription>
        <DialogFooter className='flex flex-col sm:flex-row sm:space-x-0 gap-2 w-full'>
          <Button
            onClick={handleSubscribe}
            className='flex-1'
          >
            Upgrade to Premium
          </Button>
          {showContinueButton && (
            <Button
              variant='secondary'
              onClick={handleContinue}
              className='flex-1'
            >
              {continueButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
