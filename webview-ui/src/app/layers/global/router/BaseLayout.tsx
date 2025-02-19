import { Outlet } from 'react-router-dom'
import { TooltipProvider } from '../../../../common/ui/Tooltip'
export const BaseLayout = () => {
  return (
    <div className='App h-full'>
      <div
        id='AppContent'
        className='h-full'
      >
        <TooltipProvider>
          <Outlet />
        </TooltipProvider>
      </div>
    </div>
  )
}
