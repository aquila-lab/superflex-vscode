import { Outlet, useNavigate } from 'react-router-dom'
import { useGlobal } from '../GlobalProvider'

export const AuthGuard = () => {
  const { isLoggedIn } = useGlobal()
  const navigate = useNavigate()

  if (isLoggedIn === null) {
    return null
  }

  if (!isLoggedIn) {
    navigate('/login', { replace: true })
    return null
  }

  return <Outlet />
}
