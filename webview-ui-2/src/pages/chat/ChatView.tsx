import { useEffect } from 'react'
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

export const ChatView = () => {
  const postMessage = usePostMessage()
  const { messages } = useMessages()
  const hasMessages = messages.length > 0

  useEffect(() => {
    postMessage(EventRequestType.FETCH_CURRENT_OPEN_FILE)
  }, [postMessage])

  return (
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
  )
}
