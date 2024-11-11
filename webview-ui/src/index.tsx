import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import store from './core/store';
import { getVSCodeAPI } from './api/vscodeApi';
import CustomPostHogProvider from './hooks/CustomPostHogProvider';
import { useVscTheme } from './hooks/useVscTheme';
import { VscThemeContext } from './context/VscTheme';

const Root = (): JSX.Element => (
  <StrictMode>
    <Provider store={store}>
      <CustomPostHogProvider>
        <VscThemeContext.Provider value={useVscTheme()}>
          <App vscodeAPI={getVSCodeAPI()} />
        </VscThemeContext.Provider>
      </CustomPostHogProvider>
    </Provider>
  </StrictMode>
);

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<Root />);
