import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChatView } from '../../../views/chat/ChatView'
import { LoginView } from '../../../views/login/LoginView'
import { OpenProjectView } from '../../../views/open-project/OpenProjectView'
import { SettingsView } from '../../../views/settings/SettingsView'
import { AuthenticatedLayer } from '../../authenticated/AuthenticatedLayer'
import { AuthGuard } from './AuthGuard'
import { BaseLayout } from './BaseLayout'
import { NavigationHandler } from './NavigationHandler'
import { PublicGuard } from './PublicGuard'

export const Router = () => {
  return (
    <MemoryRouter>
      <NavigationHandler>
        <Routes>
          <Route element={<PublicGuard />}>
            <Route element={<BaseLayout />}>
              <Route
                path='/login'
                element={<LoginView />}
              />
            </Route>
          </Route>

          <Route element={<AuthGuard />}>
            <Route element={<BaseLayout />}>
              <Route
                path='/open-project'
                element={<OpenProjectView />}
              />
            </Route>
          </Route>

          <Route element={<AuthGuard />}>
            <Route
              path='/'
              element={<AuthenticatedLayer />}
            >
              <Route element={<BaseLayout />}>
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
                  element={<SettingsView />}
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
      </NavigationHandler>
    </MemoryRouter>
  )
}
