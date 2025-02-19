import { Outlet, useNavigate } from 'react-router-dom'
import { LoadingView } from '../../../views/loading/LoadingView'
import { useGlobal } from '../providers/GlobalProvider'

export const AuthGuard = () => {
  const { isLoggedIn } = useGlobal()
  const navigate = useNavigate()

  if (isLoggedIn === null) {
    console.info(`Logged in: ${isLoggedIn}`)
    return <LoadingView />
  }

  if (!isLoggedIn) {
    navigate('/login', { replace: true })
    return <LoadingView />
  }

  return <Outlet />
}
