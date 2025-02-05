import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthenticatedProviders } from '../components/AuthenticatedProviders'
import { Layout } from '../layouts/Layout'
import { ChatView } from '../pages/chat/ChatView'
import { LoginView } from '../pages/login/LoginView'
import ProfileView from '../pages/profile/ProfileView'
import { AlreadyLoggedInGuard } from './AlreadyLoggedInGuard'
import { AuthGuard } from './AuthGuard'
import { NavigationHandler } from './NavigationHandler'

const OpenProject = () => <div>Open Project</div>

export const AppRouter = () => {
  return (
    <MemoryRouter>
      <NavigationHandler />

      <Routes>
        <Route element={<AlreadyLoggedInGuard />}>
          <Route element={<Layout />}>
            <Route
              path='/login'
              element={<LoginView />}
            />
          </Route>
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route
              path='/open-project'
              element={<OpenProject />}
            />
          </Route>
        </Route>

        <Route element={<AuthGuard />}>
          <Route
            path='/'
            element={<AuthenticatedProviders />}
          >
            <Route element={<Layout />}>
              <Route
                index
                element={<ChatView />}
              />
              <Route
                path='chat'
                element={<ChatView />}
              />
              <Route
                path='profile'
                element={<ProfileView />}
              />
            </Route>
          </Route>
        </Route>

        <Route
          path='*'
          element={
            <Navigate
              to='/login'
              replace
            />
          }
        />
      </Routes>
    </MemoryRouter>
  )
}
