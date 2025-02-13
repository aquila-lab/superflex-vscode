import { Outlet } from 'react-router-dom'

export const BaseLayout = () => {
  return (
    <div className='App h-full'>
      <div
        id='AppContent'
        className='h-full'
      >
        <Outlet />
      </div>
    </div>
  )
}
