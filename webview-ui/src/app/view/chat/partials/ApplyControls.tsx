import { useCallback, useRef, useState } from 'react'
import {
  EventRequestType,
  EventResponseType
} from '../../../../../../shared/protocol'
import type { ApplyState } from '../../../../common/utils'
import { useConsumeMessage } from '../../../layer/global/hooks/useConsumeMessage'
import { usePostMessage } from '../../../layer/global/hooks/usePostMessage'
import { ActionButtons } from './ActionButtons'
import { ApplyButton } from './ApplyButton'
import { ApplySpinner } from './ApplySpinner'

export const ApplyControls = ({
  filePath,
  content
}: { filePath: string; content: string }) => {
  const postMessage = usePostMessage()
  const [applyState, setApplyState] = useState<ApplyState>('idle')
  const isAwaiting = useRef(false)

  const handleApply = useCallback(() => {
    postMessage(EventRequestType.FAST_APPLY, { filePath, edits: content })
    setApplyState('applying')
    isAwaiting.current = true
  }, [postMessage, content, filePath])

  const handleAccept = useCallback(() => {
    postMessage(EventRequestType.FAST_APPLY_ACCEPT, { filePath })
    setApplyState('idle')
    isAwaiting.current = false
  }, [postMessage, filePath])

  const handleReject = useCallback(() => {
    postMessage(EventRequestType.FAST_APPLY_REJECT, { filePath })
    setApplyState('idle')
    isAwaiting.current = false
  }, [postMessage, filePath])

  const handleApplyResponse = useCallback(() => {
    if (isAwaiting.current) {
      setApplyState('applied')
    }
  }, [])

  useConsumeMessage(EventResponseType.FAST_APPLY, handleApplyResponse)

  const stateComponents = {
    idle: <ApplyButton onClick={handleApply} />,
    applying: <ApplySpinner />,
    applied: <ActionButtons onAccept={handleAccept} onReject={handleReject} />
  }

  return stateComponents[applyState]
}
