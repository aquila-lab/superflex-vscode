import { Outlet, useNavigate } from 'react-router-dom'
import { useGlobal } from '../GlobalProvider'
import { LoadingView } from '../../../view/loading/LoadingView'

export const PublicGuard = () => {
  const { isLoggedIn } = useGlobal()
  const navigate = useNavigate()

  if (isLoggedIn === null) {
    return <LoadingView />
  }

  if (isLoggedIn) {
    navigate('/chat', { replace: true })
    return <LoadingView />
  }

  return <Outlet />
}
