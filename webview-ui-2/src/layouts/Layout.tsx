import { Outlet } from 'react-router-dom'
import { SharedLayout } from './SharedLayout'

export const Layout = () => {
  console.log('Layout')
  return (
    <SharedLayout>
      <Outlet />
    </SharedLayout>
  )
}
