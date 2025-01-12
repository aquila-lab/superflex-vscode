import { GlobalProvider } from './context/GlobalContext';
import { UserProvider } from './context/UserContext';
import { VSCodeProvider } from './context/VSCodeContext';
import { AppRouter } from './router/AppRouter';

export const App = () => {
  return (
    <VSCodeProvider>
      <GlobalProvider>
        <UserProvider>
          <AppRouter />
        </UserProvider>
      </GlobalProvider>
    </VSCodeProvider>
  );
};
