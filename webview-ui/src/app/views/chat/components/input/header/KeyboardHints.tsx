import { ArrowDownIcon } from '@radix-ui/react-icons'
import { ArrowUpIcon } from '@radix-ui/react-icons'

export const KeyboardHints = () => {
  return (
    <div className='flex justify-between items-center gap-3 p-2 border-t border-border mt-auto'>
      <div className='flex items-center gap-1 text-xs'>
        <ArrowUpIcon
          className='size-4 p-1 rounded-md bg-muted'
          aria-hidden='true'
        />
        <ArrowDownIcon
          className='size-4 p-1 rounded-md bg-muted'
          aria-hidden='true'
        />
        <span className='text-muted-foreground'>Navigate</span>
      </div>

      <div className='flex items-center gap-1 text-xs'>
        <div className='py-0.5 px-1 rounded-md bg-muted'>Enter</div>
        <span className='text-muted-foreground'>Toggle</span>
      </div>
    </div>
  )
}
