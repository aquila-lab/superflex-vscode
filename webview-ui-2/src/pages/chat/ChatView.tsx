import { useEffect, useMemo } from 'react'
import { EventRequestType } from '../../../../shared/protocol'
import { usePostMessage } from '../../hooks/usePostMessage'
import { useMessages } from '../../context/MessagesContext'
import { cn } from '../../common/utils'
import { ChatHistory } from './ChatHistory'
import { ChatInputBox } from './ChatInputBox'
import { UpgradeButton } from './UpgradeButton'
import { WelcomeMessage } from './WelcomeMessage'
import { ChatMessageList } from './ChatMessageList'
import { SoftLimitModal } from './SoftLimitModal'
import { useUser } from '../../context/UserContext'
import { OutOfRequests } from './OutOfRequests'
import { FigmaPremiumModalProvider } from '../../context/FigmaPremiumModalContext'
import { FigmaPremiumModal } from './FigmaPremiumModal'

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
            {!hasMessages && <WelcomeMessage />}
            <ChatInputBox />
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
