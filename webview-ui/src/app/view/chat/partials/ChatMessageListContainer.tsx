import type { ReactNode } from 'react'
import ScrollToBottom from 'react-scroll-to-bottom'
import { useNewMessage } from '../../../layer/authenticated/NewMessageProvider'
import { LoadingDots } from './LoadingDots'

export const ChatMessageListContainer = ({
  children
}: { children: ReactNode }) => {
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()

  return (
    <div className='flex-1 flex flex-col gap-y-2 mb-4 overflow-hidden'>
      <ScrollToBottom
        className='flex flex-col gap-y-2 overflow-y-auto scroll-to-bottom'
        initialScrollBehavior='smooth'
        followButtonClassName='!bg-muted/50 hover:!bg-muted/80'
      >
        {children}
      </ScrollToBottom>

      <LoadingDots isLoading={isMessageProcessing && !isMessageStreaming} />
    </div>
  )
}
