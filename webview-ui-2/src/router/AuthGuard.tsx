import { Outlet, useNavigate } from 'react-router-dom'
import { useGlobal } from '../context/GlobalContext'

export const AuthGuard = () => {
  const { isLoggedIn } = useGlobal()
  const navigate = useNavigate()

  console.log('AuthGuard, isLoggedIn:', isLoggedIn)

  if (isLoggedIn === null) {
    return null
  }

  if (!isLoggedIn) {
    navigate('/login')
  }

  return <Outlet />
}
