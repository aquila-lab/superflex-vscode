import { Navigate, Outlet } from 'react-router-dom'
import { useGlobal } from '../context/GlobalContext'

export const AlreadyLoggedInGuard = () => {
  const { isLoggedIn } = useGlobal()

  if (isLoggedIn === null) {
    return null
  }

  if (isLoggedIn) {
    return (
      <Navigate
        to='/chat'
        replace
      />
    )
  }

  return <Outlet />
}
