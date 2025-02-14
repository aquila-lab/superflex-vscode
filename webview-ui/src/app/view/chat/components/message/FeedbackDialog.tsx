import { useCallback, useState } from 'react'
import type { Message } from '../../../../../../../shared/model'
import { EventRequestType } from '../../../../../../../shared/protocol'
import { Button } from '../../../../../common/ui/Button'
import { usePostMessage } from '../../../../layers/global/hooks/usePostMessage'

export const FeedbackDialog = ({ message }: { message: Message }) => {
  const postMessage = usePostMessage()
  const [confirmationVisible, setConfirmationVisible] = useState(false)

  const handlePositiveFeedback = useCallback(() => {
    postMessage(EventRequestType.UPDATE_MESSAGE, {
      ...message,
      feedback: 'yes'
    })
    setConfirmationVisible(true)
  }, [postMessage, message])

  const handleNegativeFeedback = useCallback(() => {
    postMessage(EventRequestType.UPDATE_MESSAGE, { ...message, feedback: 'no' })
    setConfirmationVisible(true)
  }, [postMessage, message])

  return (
    <div className='flex flex-row justify-center items-center gap-4'>
      {!confirmationVisible ? (
        <>
          <span className='text-xs'>Was this generation useful?</span>
          <div className='flex gap-2'>
            <Button
              size='xs'
              variant={'outline'}
              onClick={handlePositiveFeedback}
            >
              👍 Yes
            </Button>
            <Button
              size='xs'
              variant={'outline'}
              onClick={handleNegativeFeedback}
            >
              👎 No - Improve it
            </Button>
          </div>
        </>
      ) : (
        <p className='text-xs p-[5px]'>Thank you for your feedback!</p>
      )}
    </div>
  )
}
