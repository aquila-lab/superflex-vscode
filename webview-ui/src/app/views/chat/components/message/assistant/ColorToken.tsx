import { useCallback } from 'react'
import { getColorWithoutOpacity } from '../../../../../../common/utils'

export const ColorToken = ({ color }: { color: string }) => {
  const memoizedGetColorWithoutOpacity = useCallback(getColorWithoutOpacity, [])

  return (
    <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border font-mono text-xs'>
      <div
        className='w-3 h-3 rounded-sm'
        style={{ backgroundColor: getColorWithoutOpacity(color) }}
      />
      <span
        className='leading-none'
        style={{ color: 'inherit' }}
      >
        {memoizedGetColorWithoutOpacity(color)}
      </span>
    </span>
  )
}
