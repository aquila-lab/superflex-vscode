import { Outlet } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { MessagesProvider } from '../context/MessagesContext';
import { NewMessageProvider } from '../context/NewMessageContext';
import { ThreadsProvider } from '../context/ThreadsProvider';
import { ThreadResetWrapper } from './ThreadResetWrapper';
import { LoadingGuard } from './LoadingGuard';

export const AuthenticatedProviders = () => {
  return (
    <UserProvider>
      <LoadingGuard>
        <ThreadsProvider>
          <ThreadResetWrapper>
            <MessagesProvider>
              <NewMessageProvider>
                <Outlet />
              </NewMessageProvider>
            </MessagesProvider>
          </ThreadResetWrapper>
        </ThreadsProvider>
      </LoadingGuard>
    </UserProvider>
  );
};
