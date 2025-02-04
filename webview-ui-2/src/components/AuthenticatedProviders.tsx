import { Outlet } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { MessagesProvider } from '../context/MessagesContext';
import { NewMessageProvider } from '../context/NewMessageContext';
import { ThreadsProvider } from '../context/ThreadsProvider';
import { SyncProvider } from '../context/SyncProvider';
import { ThreadResetWrapper } from './ThreadResetWrapper';

export const AuthenticatedProviders = () => {
  return (
    <UserProvider>
      <ThreadsProvider>
        <ThreadResetWrapper>
          <MessagesProvider>
            <NewMessageProvider>
              <SyncProvider>
                <Outlet />
              </SyncProvider>
            </NewMessageProvider>
          </MessagesProvider>
        </ThreadResetWrapper>
      </ThreadsProvider>
    </UserProvider>
  );
};
