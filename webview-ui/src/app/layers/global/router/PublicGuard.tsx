import { Outlet, useNavigate } from 'react-router-dom'
import { LoadingView } from '../../../views/loading/LoadingView'
import { useGlobal } from '../providers/GlobalProvider'

export const PublicGuard = () => {
  const { isLoggedIn } = useGlobal()
  const navigate = useNavigate()

  if (isLoggedIn === null) {
    console.info(`isLoggedIn: ${isLoggedIn}`)
    return <LoadingView />
  }

  if (isLoggedIn) {
    navigate('/chat', { replace: true })
    return <LoadingView />
  }

  return <Outlet />
}
