import { Outlet, useNavigate } from 'react-router-dom'
import { useGlobal } from '../context/GlobalContext'

export const PublicGuard = () => {
  const { isLoggedIn } = useGlobal()
  const navigate = useNavigate()

  if (isLoggedIn === null) {
    return null
  }

  if (isLoggedIn) {
    navigate('/chat', { replace: true })
    return null
  }

  return <Outlet />
}
