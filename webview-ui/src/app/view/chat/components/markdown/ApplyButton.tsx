import { PlayIcon } from '@radix-ui/react-icons'
import { Button } from '../../../../../common/ui/Button'
import { commonApplyButtonStyles } from '../../../../../common/utils'

export const ApplyButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    size='xs'
    variant='text'
    className={commonApplyButtonStyles}
    onClick={onClick}
  >
    <PlayIcon className='size-3.5' />
    Apply
  </Button>
)
