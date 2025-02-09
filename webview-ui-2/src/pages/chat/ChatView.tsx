import { useEffect } from 'react'
import { EventRequestType } from '../../../../shared/protocol'
import { usePostMessage } from '../../hooks/usePostMessage'
import { useMessages } from '../../context/MessagesContext'
import { ChatHistory } from './ChatHistory'
import { ChatInputBox } from './ChatInputBox'
import { UpgradeButton } from './UpgradeButton'
import { WelcomeMessage } from './WelcomeMessage'
import { ChatMessageList } from './ChatMessageList'

export const ChatView = () => {
  const postMessage = usePostMessage()
  const { messages } = useMessages()
  const hasMessages = messages.length > 0

  useEffect(() => {
    postMessage(EventRequestType.FETCH_CURRENT_OPEN_FILE)
  }, [postMessage])

  if (!hasMessages) {
    return (
      <div className='flex flex-col h-full p-2 gap-y-6 overflow-none relative justify-center'>
        <WelcomeMessage />
        <ChatInputBox />
        <ChatHistory />
        <UpgradeButton />
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full p-2 pt-6 overflow-auto relative'>
      <ChatMessageList />
      <ChatInputBox />
      <UpgradeButton />
    </div>
  )
}
