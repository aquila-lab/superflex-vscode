import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { Button } from '../../../../../common/ui/Button'
import { useCallback } from 'react'
import { FEEDBACK_URL } from '../../../../../common/utils'
import { usePostMessage } from '../../../../layers/global/hooks/usePostMessage'
import { EventRequestType } from '../../../../../../../shared/protocol/events'

export const FeedbackButton = () => {
  const postMessage = usePostMessage()

  const handleLeaveFeedback = useCallback(() => {
    postMessage(EventRequestType.OPEN_EXTERNAL_URL, { url: FEEDBACK_URL })
  }, [postMessage])

  return (
    <Button
      className='w-full'
      variant='outline'
      onClick={handleLeaveFeedback}
    >
      Leave Feedback <ExternalLinkIcon className='h-4 w-4' />
    </Button>
  )
}
