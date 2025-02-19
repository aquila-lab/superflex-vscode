import { Outlet } from 'react-router-dom'
import { LoadingGuard } from './components/LoadingGuard'
import { MessagesProvider } from './providers/MessagesProvider'
import { NewMessageProvider } from './providers/NewMessageProvider'
import { ThreadReset } from './components/ThreadReset'
import { ThreadsProvider } from './providers/ThreadsProvider'
import { UserProvider } from './providers/UserProvider'
import { ReloadHandler } from './components/ReloadHandler'

export const AuthenticatedLayer = () => {
  return (
    <UserProvider>
      <LoadingGuard>
        <ThreadsProvider>
          <ThreadReset>
            <ReloadHandler>
              <MessagesProvider>
                <NewMessageProvider>
                  <Outlet />
                </NewMessageProvider>
              </MessagesProvider>
            </ReloadHandler>
          </ThreadReset>
        </ThreadsProvider>
      </LoadingGuard>
    </UserProvider>
  )
}
