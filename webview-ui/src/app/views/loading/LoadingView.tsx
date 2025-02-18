import { LoadingBar } from '../../../common/ui/LoadingBar'

export const LoadingView = () => {
  return (
    <div className='relative w-full h-screen'>
      <LoadingBar className='absolute top-0.5 left-0' />
    </div>
  )
}
