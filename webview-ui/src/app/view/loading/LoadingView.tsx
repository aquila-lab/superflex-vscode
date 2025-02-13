import { chatInputDisabledClasses } from '../../../common/utils'

export const LoadingView = () => {
  return (
    <div className={chatInputDisabledClasses}>
      <div className='relative flex flex-col bg-sidebar z-10 w-[calc(100%+2px)] ml-[1px] overflow-hidden -mt-[4px]'>
        <div className='flex items-center justify-center h-[calc(100vh+8px)] overflow-hidden' />
      </div>
    </div>
  )
}
