import { useEffect, useMemo } from 'react'
import { EventRequestType } from '../../../../../shared/protocol'
import { cn } from '../../../common/utils'
import { useMessages } from '../../layers/authenticated/providers/MessagesProvider'
import { useUser } from '../../layers/authenticated/providers/UserProvider'
import { usePostMessage } from '../../layers/global/hooks/usePostMessage'

import { FigmaPremiumModal } from './components/FigmaPremiumModal'
import { FigmaPremiumModalProvider } from './providers/FigmaPremiumModalProvider'
import { Hints } from './components/Hints'
import { OutOfRequests } from './components/OutOfRequests'
import { SoftLimitModal } from './components/SoftLimitModal'
import { UpgradeButton } from './components/UpgradeButton'
import { WelcomeMessage } from './components/WelcomeMessage'
import { ChatHistory } from './components/history/ChatHistory'
import { ChatInputBoxWrapper } from './components/input/ChatInputBoxWrapper'
import { ChatMessageList } from './components/message/ChatMessageList'

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
            {hasMessages && <ChatMessageList />}
            {!hasMessages && (
              <div className='flex flex-col gap-y-2 mb-4'>
                <WelcomeMessage />
                <Hints />
              </div>
            )}
            <ChatInputBoxWrapper />
            {!hasMessages && <ChatHistory />}
            <UpgradeButton />
            <SoftLimitModal />
          </div>
          <FigmaPremiumModal />
        </FigmaPremiumModalProvider>
      )}
    </>
  )
}
