import { type ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../shared/protocol'
import { useGlobal } from '../context/GlobalContext'
import { useConsumeMessage } from '../hooks/useConsumeMessage'

export const NavigationHandler = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const { setIsLoggedIn } = useGlobal()

  const handleMessage = useCallback(
    ({ command }: TypedEventResponseMessage) => {
      switch (command) {
        case EventResponseType.SHOW_LOGIN_VIEW: {
          setIsLoggedIn(false)
          navigate('/login', { replace: true })
          break
        }
        case EventResponseType.SHOW_CHAT_VIEW: {
          setIsLoggedIn(true)
          navigate('/chat', { replace: true })
          break
        }
        case EventResponseType.SHOW_SETTINGS_VIEW: {
          navigate('/profile', { replace: true })
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

  return children
}
