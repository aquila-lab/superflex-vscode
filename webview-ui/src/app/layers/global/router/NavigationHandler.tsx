import { type ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../hooks/useConsumeMessage'
import { useGlobal } from '../providers/GlobalProvider'

export const NavigationHandler = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const { setIsLoggedIn } = useGlobal()

  const handleMessage = useCallback(
    ({ command, error }: TypedEventResponseMessage) => {
      // CRITICAL: Proper error handling required!
      // Never remove this check it will break the app.
      if (error) {
        return
      }

      switch (command) {
        case EventResponseType.SHOW_LOGIN_VIEW: {
          setIsLoggedIn(false)
          navigate('/login', { replace: true })
          console.info('SHOW_LOGIN_VIEW')
          break
        }
        case EventResponseType.SHOW_CHAT_VIEW: {
          setIsLoggedIn(true)
          navigate('/chat', { replace: true })
          console.info('SHOW_CHAT_VIEW')
          break
        }
        case EventResponseType.SHOW_SETTINGS_VIEW: {
          navigate('/profile', { replace: true })
          console.info('SHOW_SETTINGS_VIEW')
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

  return children
}
