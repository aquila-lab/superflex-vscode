import { Outlet } from 'react-router-dom'
import { ThreadsProvider } from './ThreadsProvider'
import { LoadingGuard } from './LoadingGuard'
import { ThreadReset } from './ThreadReset'
import { OverlayProvider } from './OverlayProvider'
import { MessagesProvider } from './MessagesProvider'
import { NewMessageProvider } from './NewMessageProvider'
import { UserProvider } from './UserProvider'

export const AuthenticatedProviders = () => {
  return (
    <UserProvider>
      <LoadingGuard>
        <ThreadsProvider>
          <ThreadReset>
            <OverlayProvider>
              <MessagesProvider>
                <NewMessageProvider>
                  <Outlet />
                </NewMessageProvider>
              </MessagesProvider>
            </OverlayProvider>
          </ThreadReset>
        </ThreadsProvider>
      </LoadingGuard>
    </UserProvider>
  )
}
