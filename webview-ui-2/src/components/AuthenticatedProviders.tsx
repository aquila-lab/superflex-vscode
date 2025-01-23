import { Outlet } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { MessagesProvider } from '../context/MessagesContext';
import { NewMessageProvider } from '../context/NewMessageContext';
import { ThreadsProvider } from '../context/ThreadsProvider';
import { InputController } from '../pages/chat/InputController';

export const AuthenticatedProviders = () => {
  return (
    <UserProvider>
      <ThreadsProvider>
        <MessagesProvider>
          <NewMessageProvider>
            <InputController>
              <Outlet />
            </InputController>
          </NewMessageProvider>
        </MessagesProvider>
      </ThreadsProvider>
    </UserProvider>
  );
};
