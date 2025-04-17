import { useCallback } from 'react'
import { CircleIcon } from '@radix-ui/react-icons'

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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogContent className='w-full'>
        <DialogHeader>
          <DialogTitle className='text-left'>Figma to Code</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div>
            <p className='text-xs text-muted-foreground'>
              Figma integration is a premium feature available exclusively for
              Premium and Team plans.
            </p>
            <ul className='text-foreground mt-2'>
              <li className='flex items-center gap-2'>
                <CircleIcon className='w-1 h-1' /> Connect to Figma for
                design-to-code
              </li>
              <li className='flex items-center gap-2'>
                <CircleIcon className='w-1 h-1' /> Extract code from Figma
                designs
              </li>
              <li className='flex items-center gap-2'>
                <CircleIcon className='w-1 h-1' /> Process unlimited nodes
              </li>
              <li className='flex items-center gap-2'>
                <CircleIcon className='w-1 h-1' /> Make unlimited requests
              </li>
            </ul>
          </div>
          <p className='text-xs text-muted-foreground mt-2'>
            Upgrade to Premium for full Figma integration and more powerful
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
