import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EventRequestType,
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../shared/protocol'
import { useGlobal } from '../context/GlobalContext'
import { useConsumeMessage } from '../hooks/useConsumeMessage'
import { usePostMessage } from '../hooks/usePostMessage'

export const NavigationHandler = () => {
  const postMessage = usePostMessage()
  const navigate = useNavigate()
  const { setIsLoggedIn } = useGlobal()

  const handleMessage = useCallback(
    ({ command }: TypedEventResponseMessage) => {
      switch (command) {
        case EventResponseType.SHOW_LOGIN_VIEW: {
          console.log('SHOW_LOGIN_VIEW')
          setIsLoggedIn(false)
          navigate('/login')
          break
        }
        case EventResponseType.SHOW_CHAT_VIEW: {
          console.log('SHOW_CHAT_VIEW')
          setIsLoggedIn(true)
          navigate('/chat')
          break
        }
        case EventResponseType.SHOW_SETTINGS_VIEW: {
          console.log('SHOW_SETTINGS_VIEW')
          navigate('/profile')
          break
        }
      }
    },
    [navigate, setIsLoggedIn]
  )

  useConsumeMessage(
    [
      EventResponseType.SHOW_LOGIN_VIEW,
      EventResponseType.SHOW_CHAT_VIEW,
      EventResponseType.SHOW_SETTINGS_VIEW
    ],
    handleMessage
  )

  useEffect(() => {
    postMessage(EventRequestType.READY)
  }, [postMessage])

  return null
}
