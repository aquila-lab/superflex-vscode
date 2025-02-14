import { TrashIcon } from '@radix-ui/react-icons'
import { Button } from '../../../../../../common/ui/Button'

export const StopButton = ({
  onClick
}: {
  onClick: () => void
}) => (
  <Button
    size='xs'
    variant='text'
    className='text-[11px] px-1 py-0 hover:bg-muted'
    onClick={onClick}
  >
    <TrashIcon className='size-3.5' />
    stop
  </Button>
)
