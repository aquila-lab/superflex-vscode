import { GlobalProvider } from './context/GlobalContext';
import { SyncProvider } from './context/SyncProvider';
import { VSCodeProvider } from './context/VSCodeContext';
import { AppRouter } from './router/AppRouter';

export const App = () => {
  return (
    <VSCodeProvider>
      <SyncProvider>
        <GlobalProvider>
          <AppRouter />
        </GlobalProvider>
      </SyncProvider>
    </VSCodeProvider>
  );
};
