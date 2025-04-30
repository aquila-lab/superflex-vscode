import { Outlet } from 'react-router-dom'
import { LoadingGuard } from './components/LoadingGuard'
import { ReloadHandler } from './components/ReloadHandler'
import { ThreadReset } from './components/ThreadReset'
import { EnhancePromptProvider } from './providers/EnhancePromptProvider'
import { MessagesProvider } from './providers/MessagesProvider'
import { NewMessageProvider } from './providers/NewMessageProvider'
import { ThreadsProvider } from './providers/ThreadsProvider'
import { UserProvider } from './providers/UserProvider'

export const AuthenticatedLayer = () => {
  return (
    <UserProvider>
      <LoadingGuard>
        <ThreadsProvider>
          <ThreadReset>
            <ReloadHandler>
              <MessagesProvider>
                <EnhancePromptProvider>
                  <NewMessageProvider>
                    <Outlet />
                  </NewMessageProvider>
                </EnhancePromptProvider>
              </MessagesProvider>
            </ReloadHandler>
          </ThreadReset>
        </ThreadsProvider>
      </LoadingGuard>
    </UserProvider>
  )
}
