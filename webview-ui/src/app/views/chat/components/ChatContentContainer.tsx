import type { ReactNode } from 'react'
import { cn } from '../../../../common/utils'
import { useMessages } from '../../../layers/authenticated/providers/MessagesProvider'

export const ChatContentContainer = ({ children }: { children: ReactNode }) => {
  const { hasMessages } = useMessages()

  return (
    <div
      className={cn(
        'flex flex-col h-full p-2 pt-6 overflow-auto relative',
        !hasMessages && 'justify-center'
      )}
    >
      {children}
    </div>
  )
}
