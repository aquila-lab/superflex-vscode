import { type ReactNode, useRef } from 'react'
import { chatInputEnabledClasses } from '../../../../../common/utils'
import { useTextareaClickHandler } from '../../hooks/useTextareaClickHandler'

export const AdvancedTextareaContainer = ({
  children
}: { children: ReactNode }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useTextareaClickHandler({
    wrapperRef
  })

  return (
    <div
      ref={wrapperRef}
      className={chatInputEnabledClasses}
    >
      <div className='relative flex flex-col bg-input rounded-md z-10'>
        {children}
      </div>
    </div>
  )
}
