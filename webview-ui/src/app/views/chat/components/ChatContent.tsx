import { useMessages } from '../../../layers/authenticated/providers/MessagesProvider'
import { ChatContentContainer } from './ChatContentContainer'
import { UpgradeButton } from './UpgradeButton'
import { EmptyStateContent } from './empty/EmptyStateContent'
import { ThreadHistory } from './history/ThreadHistory'
import { AdvancedTextarea } from './input/AdvancedTextarea'
import { MessageList } from './message/MessageList'

export const ChatContent = () => {
  const { hasMessages } = useMessages()

  return (
    <ChatContentContainer>
      {hasMessages && <MessageList />}
      {!hasMessages && <EmptyStateContent />}
      <AdvancedTextarea />
      {!hasMessages && <ThreadHistory />}
      <UpgradeButton />
    </ChatContentContainer>
  )
}
