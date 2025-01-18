import { Outlet } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { MessagesProvider } from '../context/MessagesContext';
import { NewMessageProvider } from '../context/NewMessageContext';

export const AuthenticatedProviders = () => {
  return (
    <UserProvider>
      <MessagesProvider>
        <NewMessageProvider>
          <Outlet />
        </NewMessageProvider>
      </MessagesProvider>
    </UserProvider>
  );
};
