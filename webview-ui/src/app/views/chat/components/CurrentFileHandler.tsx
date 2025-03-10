import { type ReactNode, useEffect } from 'react'
import { EventRequestType } from '../../../../../../shared/protocol'
import { usePostMessage } from '../../../layers/global/hooks/usePostMessage'

export const CurrentFileHandler = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage()

  useEffect(() => {
    postMessage(EventRequestType.FETCH_SUPERFLEX_RULES)
    postMessage(EventRequestType.FETCH_CURRENT_OPEN_FILE)
  })

  return children
}
