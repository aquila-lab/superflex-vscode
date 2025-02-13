import { Button } from '../../../../common/ui/Button'
import { Separator } from '../../../../common/ui/Separator'
import { commonApplyButtonStyles } from '../../../../common/utils'

export const ActionButtons = ({
  onAccept,
  onReject
}: {
  onAccept: () => void
  onReject: () => void
}) => (
  <div className='flex items-center gap-1 ml-2'>
    <Button
      size='xs'
      variant='text'
      className={commonApplyButtonStyles}
      onClick={onAccept}
    >
      ✅ Accept
    </Button>
    <Separator orientation='vertical' className='h-4' />
    <Button
      size='xs'
      variant='text'
      className={commonApplyButtonStyles}
      onClick={onReject}
    >
      ❌ Reject
    </Button>
  </div>
)
