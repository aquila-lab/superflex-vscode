import { type ReactNode, useMemo, useRef } from 'react'
import {
  chatInputDisabledClasses,
  chatInputEnabledClasses,
  cn
} from '../../../../../common/utils'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { useTextareaClickHandler } from '../../hooks/useTextareaClickHandler'
import { useEditMode } from '../../providers/EditModeProvider'

export const AdvancedTextareaContainer = ({
  children
}: { children: ReactNode }) => {
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()
  const { isMainTextarea } = useEditMode()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isDisabled = useMemo(
    () => (isMessageProcessing || isMessageStreaming) && isMainTextarea,
    [isMessageProcessing, isMessageStreaming, isMainTextarea]
  )

  useTextareaClickHandler({
    wrapperRef
  })

  return (
    <div
      ref={wrapperRef}
      className={cn(
        isDisabled ? chatInputDisabledClasses : chatInputEnabledClasses
      )}
    >
      <div className='relative flex flex-col bg-input rounded-md z-10'>
        {children}
      </div>
    </div>
  )
}
