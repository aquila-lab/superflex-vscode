import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useGlobal } from '../context/GlobalContext'

export const AlreadyLoggedInGuard = () => {
  const { isLoggedIn } = useGlobal()
  const navigate = useNavigate()

  if (isLoggedIn === null) {
    return null
  }

  if (isLoggedIn) {
    navigate('/chat')
  }

  return <Outlet />
}
