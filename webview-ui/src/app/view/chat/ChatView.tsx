import { useEffect, useMemo } from 'react'
import { EventRequestType } from '../../../../../shared/protocol'
import { cn } from '../../../common/utils'
import { useMessages } from '../../layers/authenticated/providers/MessagesProvider'
import { useUser } from '../../layers/authenticated/providers/UserProvider'
import { usePostMessage } from '../../layers/global/hooks/usePostMessage'

import { FigmaPremiumModal } from './components/FigmaPremiumModal'
import { FigmaPremiumModalProvider } from './providers/FigmaPremiumModalProvider'
import { Hints } from './components/hints/Hints'
import { OutOfRequests } from './components/OutOfRequests'
import { SoftLimitModal } from './components/SoftLimitModal'
import { UpgradeButton } from './components/UpgradeButton'
import { WelcomeMessage } from './components/WelcomeMessage'
import { ChatInputBoxWrapper } from './components/input/ChatInputBoxWrapper'
import { ThreadHistory } from './components/history/ThreadHistory'
import { MessageList } from './components/message/MessageList'

export const ChatView = () => {
  const postMessage = usePostMessage()
  const { messages } = useMessages()
  const { subscription } = useUser()
  const hasMessages = messages.length > 0

  const isOutOfRequests = useMemo(
    () =>
      subscription?.plan &&
      subscription.basicRequestsUsed >= subscription.plan.basicRequestLimit,
    [subscription]
  )

  useEffect(() => {
    postMessage(EventRequestType.FETCH_CURRENT_OPEN_FILE)
  })

  return (
    <>
      {isOutOfRequests && <OutOfRequests />}
      {!isOutOfRequests && (
        <FigmaPremiumModalProvider>
          <div
            className={cn(
              'flex flex-col h-full p-2 pt-6 overflow-auto relative',
              !hasMessages && 'justify-center'
            )}
          >
            {hasMessages && <MessageList />}
            {!hasMessages && (
              <div className='flex flex-col gap-y-2 mb-4'>
                <WelcomeMessage />
                <Hints />
              </div>
            )}
            <ChatInputBoxWrapper />
            {!hasMessages && <ThreadHistory />}
            <UpgradeButton />
            <SoftLimitModal />
          </div>
          <FigmaPremiumModal />
        </FigmaPremiumModalProvider>
      )}
    </>
  )
}
