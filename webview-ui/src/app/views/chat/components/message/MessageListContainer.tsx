import type { ReactNode } from 'react'
import ScrollToBottom from 'react-scroll-to-bottom'

export const MessageListContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className='flex-1 flex flex-col gap-y-2 mb-2 overflow-hidden'>
      <ScrollToBottom
        className='flex flex-col gap-y-2 overflow-y-auto scroll-to-bottom'
        initialScrollBehavior='auto'
        mode='bottom'
        followButtonClassName='!bg-muted/50 hover:!bg-muted/80'
      >
        {children}
      </ScrollToBottom>
    </div>
  )
}
