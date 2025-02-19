import { Outlet } from 'react-router-dom'
export const BaseLayout = () => {
  return (
    <div
      id='AppContent'
      className='h-full overflow-auto'
    >
      <Outlet />
    </div>
  )
}
