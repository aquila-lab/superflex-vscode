import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useGlobal } from '../context/GlobalContext'

export const AlreadyLoggedInGuard = () => {
  const { isLoggedIn } = useGlobal()
  const navigate = useNavigate()

  console.log('AlreadyLoggedInGuard, isLoggedIn:', isLoggedIn)

  if (isLoggedIn === null) {
    return null
  }

  if (isLoggedIn) {
    navigate('/chat')
  }

  return <Outlet />
}
