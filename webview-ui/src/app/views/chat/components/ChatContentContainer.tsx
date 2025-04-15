import type { ReactNode } from 'react'
import { cn } from '../../../../common/utils'
import { useMessages } from '../../../layers/authenticated/providers/MessagesProvider'
import { LoadingBar } from '../../../../common/ui/LoadingBar'
import { useNewMessage } from '../../../layers/authenticated/providers/NewMessageProvider'

export const ChatContentContainer = ({ children }: { children: ReactNode }) => {
  const { hasMessages } = useMessages()
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()

  return (
    <>
      {(isMessageProcessing || isMessageStreaming) && <LoadingBar />}

      <div
        className={cn(
          'flex flex-col h-full p-2 pt-6 overflow-hidden relative',
          !hasMessages && 'justify-center'
        )}
      >
        {children}
      </div>
    </>
  )
}
