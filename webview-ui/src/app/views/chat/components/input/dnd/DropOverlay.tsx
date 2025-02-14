export const DropOverlay = ({
  isDragging
}: {
  isDragging: boolean
}) => {
  if (!isDragging) {
    return null
  }

  return (
    <div className='absolute inset-0 pointer-events-none z-30 bg-black/20'>
      <div className='h-full w-full flex items-center justify-center'>
        <span className='text-xs text-primary bg-sidebar px-4 py-2 rounded-md shadow-sm'>
          Drop image here
        </span>
      </div>
    </div>
  )
}
