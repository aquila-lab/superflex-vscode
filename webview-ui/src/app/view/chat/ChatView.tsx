import { useEffect, useMemo } from 'react'
import { EventRequestType } from '../../../../../shared/protocol'
import { cn } from '../../../common/utils'
import { useMessages } from '../../layer/authenticated/MessagesProvider'
import { useUser } from '../../layer/authenticated/UserProvider'
import { usePostMessage } from '../../layer/global/hooks/usePostMessage'
import { ChatHistory } from './partials/ChatHistory'
import { ChatInputBoxWrapper } from './partials/ChatInputBoxWrapper'
import { ChatMessageList } from './partials/ChatMessageList'
import { FigmaPremiumModal } from './partials/FigmaPremiumModal'
import { FigmaPremiumModalProvider } from './partials/FigmaPremiumModalProvider'
import { Hints } from './partials/Hints'
import { OutOfRequests } from './partials/OutOfRequests'
import { SoftLimitModal } from './partials/SoftLimitModal'
import { UpgradeButton } from './partials/UpgradeButton'
import { WelcomeMessage } from './partials/WelcomeMessage'

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
