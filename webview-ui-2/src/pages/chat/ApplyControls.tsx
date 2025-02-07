import { useCallback, useState } from 'react'
import type { ApplyState } from '../../common/utils'
import { ApplySpinner } from './ApplySpinner'
import { ApplyButton } from './ApplyButton'
import { ActionButtons } from './ActionButtons'
import { usePostMessage } from '../../hooks/usePostMessage'
import {
  EventRequestType,
  EventResponseType
} from '../../../../shared/protocol'
import { useConsumeMessage } from '../../hooks/useConsumeMessage'

export const ApplyControls = ({
  filePath,
  content
}: { filePath: string; content: string }) => {
  const postMessage = usePostMessage()
  const [applyState, setApplyState] = useState<ApplyState>('idle')

  const handleApply = useCallback(() => {
    postMessage(EventRequestType.FAST_APPLY, { filePath, edits: content })
    setApplyState('applying')
  }, [postMessage, content, filePath])

  const handleAccept = useCallback(() => {
    postMessage(EventRequestType.FAST_APPLY_ACCEPT, { filePath })
    setApplyState('idle')
  }, [postMessage, filePath])

  const handleReject = useCallback(() => {
    postMessage(EventRequestType.FAST_APPLY_REJECT, { filePath })
    setApplyState('idle')
  }, [postMessage, filePath])

  const handleApplyResponse = useCallback(() => {
    setApplyState('applied')
  }, [])

  useConsumeMessage(EventResponseType.FAST_APPLY, handleApplyResponse)

  const stateComponents = {
    idle: <ApplyButton onClick={handleApply} />,
    applying: <ApplySpinner />,
    applied: <ActionButtons onAccept={handleAccept} onReject={handleReject} />
  }

  return stateComponents[applyState]
}
