import { useCallback, useState } from 'react'
import { EventResponseType } from '../../../../../../../shared/protocol'
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
import { useConsumeMessage } from '../../../../layers/global/hooks/useConsumeMessage'

export function SoftLimitModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { subscribe } = useUser()

  const handleSubscribe = () => {
    subscribe()
    setIsOpen(false)
  }

  const handleShowModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  useConsumeMessage(EventResponseType.SHOW_SOFT_PAYWALL_MODAL, handleShowModal)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleCloseModal}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='text-left'>
            Premium Requests Exhausted
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          You&apos;ve used all your premium requests. Subscribe for unlimited
          access or continue with free requests!
        </DialogDescription>
        <DialogFooter className='flex flex-col sm:flex-row sm:justify-start gap-2'>
          <Button onClick={handleSubscribe}>Upgrade to Premium</Button>
          <Button
            variant='secondary'
            onClick={handleCloseModal}
          >
            Switch to Basic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
