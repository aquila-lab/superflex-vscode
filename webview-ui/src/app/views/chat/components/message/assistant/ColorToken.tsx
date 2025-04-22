export const ColorToken = ({ color }: { color: string }) => {
  return (
    <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border font-mono text-xs'>
      <div
        className='w-3 h-3 rounded-sm'
        style={{ backgroundColor: color }}
      />
      <span
        className='leading-none'
        style={{ color: 'inherit' }}
      >
        {color}
      </span>
    </span>
  )
}
