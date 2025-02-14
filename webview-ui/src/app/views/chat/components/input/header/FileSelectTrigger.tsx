import { PlusIcon } from '@radix-ui/react-icons'
import { Button } from '../../../../../../common/ui/Button'
import { PopoverTrigger } from '../../../../../../common/ui/Popover'

export const FileSelectTrigger = ({ open }: { open: boolean }) => (
  <PopoverTrigger asChild>
    <Button
      variant='outline'
      size='icon'
      aria-expanded={open}
    >
      <span className='sr-only'>Select Files</span>
      <PlusIcon
        className='text-muted-foreground'
        aria-hidden='true'
      />
    </Button>
  </PopoverTrigger>
)
