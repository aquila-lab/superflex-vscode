import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthenticatedProviders } from '../../authenticated/AuthenticatedProviders'
import { AuthGuard } from './AuthGuard'
import { BaseLayout } from './BaseLayout'
import { NavigationHandler } from './NavigationHandler'
import { PublicGuard } from './PublicGuard'
import { OpenProjectView } from '../../../view/open-project/OpenProjectView'
import { SettingsView } from '../../../view/settings/SettingsView'
import { LoginView } from '../../../view/login/LoginView'
import { ChatView } from '../../../view/chat/ChatView'

export const Router = () => {
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
                <Route path='profile' element={<SettingsView />} />
              </Route>
            </Route>
          </Route>

          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </NavigationHandler>
    </MemoryRouter>
  )
}
