import { Outlet } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { MessagesProvider } from '../context/MessagesContext';
import { NewMessageProvider } from '../context/NewMessageContext';
import { ThreadsProvider } from '../context/ThreadsProvider';
import { SyncProvider } from '../context/SyncProvider';

export const AuthenticatedProviders = () => {
  return (
    <UserProvider>
      <ThreadsProvider>
        <MessagesProvider>
          <NewMessageProvider>
            <SyncProvider>
              <Outlet />
            </SyncProvider>
          </NewMessageProvider>
        </MessagesProvider>
      </ThreadsProvider>
    </UserProvider>
  );
};
