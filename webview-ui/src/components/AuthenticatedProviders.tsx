import { Outlet } from 'react-router-dom'
import { MessagesProvider } from '../context/MessagesContext'
import { NewMessageProvider } from '../context/NewMessageContext'
import { ThreadsProvider } from '../context/ThreadsProvider'
import { UserProvider } from '../context/UserContext'
import { LoadingGuard } from './LoadingGuard'
import { ThreadResetWrapper } from './ThreadResetWrapper'
import { OverlayProvider } from '../context/OverlayContext'

export const AuthenticatedProviders = () => {
  return (
    <UserProvider>
      <LoadingGuard>
        <ThreadsProvider>
          <ThreadResetWrapper>
            <OverlayProvider>
              <MessagesProvider>
                <NewMessageProvider>
                  <Outlet />
                </NewMessageProvider>
              </MessagesProvider>
            </OverlayProvider>
          </ThreadResetWrapper>
        </ThreadsProvider>
      </LoadingGuard>
    </UserProvider>
  )
}
