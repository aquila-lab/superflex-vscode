import { useMessages } from '../../../layers/authenticated/providers/MessagesProvider'
import { ChatContentContainer } from './ChatContentContainer'
import { EmptyStateContent } from './EmptyStateContent'
import { ThreadHistory } from './history/ThreadHistory'
import { ChatInputBoxWrapper } from './input/ChatInputBoxWrapper'
import { MessageList } from './message/MessageList'
import { SoftLimitModal } from './SoftLimitModal'
import { UpgradeButton } from './UpgradeButton'

export const ChatContent = () => {
  const { hasMessages } = useMessages()

  return (
    <ChatContentContainer>
      {hasMessages && <MessageList />}
      {!hasMessages && <EmptyStateContent />}
      <ChatInputBoxWrapper />
      {!hasMessages && <ThreadHistory />}
      <UpgradeButton />
      <SoftLimitModal />
    </ChatContentContainer>
  )
}
