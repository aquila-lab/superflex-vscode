import { useEffect } from 'react'
import { EventRequestType } from '../../../../shared/protocol'
import { usePostMessage } from '../../hooks/usePostMessage'
import { ChatInputBox } from './ChatInputBox'
import { ChatMessageList } from './ChatMessageList'

export const ChatView = () => {
  const postMessage = usePostMessage()

  useEffect(() => {
    postMessage(EventRequestType.FETCH_CURRENT_OPEN_FILE)
  }, [postMessage])

  return (
    <div className='flex flex-col h-full p-2 pt-0 overflow-auto'>
      <ChatMessageList />
      <ChatInputBox isMainChat />
    </div>
  )
}
