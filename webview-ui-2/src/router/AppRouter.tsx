import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthenticatedProviders } from '../components/AuthenticatedProviders'
import { ChatView } from '../pages/chat/ChatView'
import { LoginView } from '../pages/login/LoginView'
import { OpenProjectView } from '../pages/open-project/OpenProjectView'
import ProfileView from '../pages/profile/ProfileView'
import { AuthGuard } from './AuthGuard'
import { BaseLayout } from './BaseLayout'
import { NavigationHandler } from './NavigationHandler'
import { PublicGuard } from './PublicGuard'

export const AppRouter = () => {
  return (
    <MemoryRouter>
      <NavigationHandler>
        <Routes>
          <Route element={<PublicGuard />}>
            <Route element={<BaseLayout />}>
              <Route path='/login' element={<LoginView />} />
            </Route>
          </Route>

          <Route element={<AuthGuard />}>
            <Route element={<BaseLayout />}>
              <Route path='/open-project' element={<OpenProjectView />} />
            </Route>
          </Route>

          <Route element={<AuthGuard />}>
            <Route path='/' element={<AuthenticatedProviders />}>
              <Route element={<BaseLayout />}>
                <Route index element={<ChatView />} />
                <Route path='chat' element={<ChatView />} />
                <Route path='profile' element={<ProfileView />} />
              </Route>
            </Route>
          </Route>

          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </NavigationHandler>
    </MemoryRouter>
  )
}
