import { Outlet } from 'react-router-dom'
import { LoadingGuard } from './LoadingGuard'
import { MessagesProvider } from './MessagesProvider'
import { NewMessageProvider } from './NewMessageProvider'
import { OverlayProvider } from './OverlayProvider'
import { ThreadReset } from './ThreadReset'
import { ThreadsProvider } from './ThreadsProvider'
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
