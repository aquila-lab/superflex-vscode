import { useCallback, useRef } from 'react'
import {
  EventRequestType,
  EventResponseType
} from '../../../../../../../../../../../shared/protocol'
import { useConsumeMessage } from '../../../../../../../../layers/global/hooks/useConsumeMessage'
import { usePostMessage } from '../../../../../../../../layers/global/hooks/usePostMessage'
import { useCodeApplyState } from '../../../../../../providers/CodeApplyStateProvider'
import { ActionButtons } from './ActionButtons'
import { ApplyButton } from './ApplyButton'
import { ApplySpinner } from './ApplySpinner'

export const ApplyControls = ({
  filePath,
  content
}: {
  filePath: string
  content: string
}) => {
  const postMessage = usePostMessage()
  const { getApplyState, setApplyState } = useCodeApplyState()
  const { state: applyState, isAwaiting } = getApplyState(filePath)
  const isAwaitingRef = useRef(isAwaiting)

  isAwaitingRef.current = isAwaiting

  const handleApply = useCallback(() => {
    postMessage(EventRequestType.FAST_APPLY, { filePath, edits: content })
    setApplyState(filePath, 'applying', true)
    isAwaitingRef.current = true
  }, [postMessage, content, filePath, setApplyState])

  const handleAccept = useCallback(() => {
    postMessage(EventRequestType.FAST_APPLY_ACCEPT, { filePath })
    setApplyState(filePath, 'idle', false)
    isAwaitingRef.current = false
  }, [postMessage, filePath, setApplyState])

  const handleReject = useCallback(() => {
    postMessage(EventRequestType.FAST_APPLY_REJECT, { filePath })
    setApplyState(filePath, 'idle', false)
    isAwaitingRef.current = false
  }, [postMessage, filePath, setApplyState])

  const handleApplyResponse = useCallback(() => {
    if (isAwaitingRef.current) {
      setApplyState(filePath, 'applied', true)
    }
  }, [filePath, setApplyState])

  useConsumeMessage(EventResponseType.FAST_APPLY, handleApplyResponse)

  const stateComponents = {
    idle: <ApplyButton onClick={handleApply} />,
    applying: <ApplySpinner />,
    applied: (
      <ActionButtons
        onAccept={handleAccept}
        onReject={handleReject}
      />
    )
  }

  return stateComponents[applyState]
}
