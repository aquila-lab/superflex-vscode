import { useCallback, useState } from 'react'

import {
  EventRequestType,
  type EventResponseMessage,
  EventResponseType
} from '../../../../../shared/protocol'
import { useConsumeMessage } from '../../layer/global/hooks/useConsumeMessage'
import { usePostMessage } from '../../layer/global/hooks/usePostMessage'
import { LoginAuthLinkView } from './partials/LoginAuthLinkView'
import { LoginDefaultView } from './partials/LoginDefaultView'

export const LoginView = () => {
  const postMessage = usePostMessage()
  const [authUniqueLink, setAuthUniqueLink] = useState<string | null>(null)

  const handleAuthLink = useCallback(
    ({ payload }: EventResponseMessage<EventResponseType.CREATE_AUTH_LINK>) => {
      setAuthUniqueLink(payload.uniqueLink)
    },
    []
  )

  useConsumeMessage(EventResponseType.CREATE_AUTH_LINK, handleAuthLink)

  const handleCopyLink = useCallback(() => {
    if (authUniqueLink) {
      navigator.clipboard.writeText(authUniqueLink)
      postMessage(EventRequestType.SEND_NOTIFICATION, {
        message: 'Link copied to clipboard'
      })
    }
  }, [authUniqueLink, postMessage])

  const handleReturnToLogin = useCallback(() => {
    setAuthUniqueLink(null)
  }, [])

  if (authUniqueLink) {
    return (
      <LoginAuthLinkView
        authUniqueLink={authUniqueLink}
        onCopyLink={handleCopyLink}
        onReturnToLogin={handleReturnToLogin}
      />
    )
  }

  return <LoginDefaultView />
}
