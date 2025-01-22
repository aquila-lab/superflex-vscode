import { Outlet } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { MessagesProvider } from '../context/MessagesContext';
import { NewMessageProvider } from '../context/NewMessageContext';
import { ThreadsProvider } from '../context/ThreadsProvider';

export const AuthenticatedProviders = () => {
  return (
    <UserProvider>
      <ThreadsProvider>
          <MessagesProvider>
            <NewMessageProvider>
              <Outlet />
            </NewMessageProvider>
          </MessagesProvider>
      </ThreadsProvider>
    </UserProvider>
  );
};
