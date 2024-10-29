import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import './index.css';
import App from './App';
import store from './core/store';
import { getVSCodeAPI } from './api/vscodeApi';
import CustomPostHogProvider from './hooks/CustomPostHogProvider';

const Root = (): JSX.Element => (
  <StrictMode>
    <Provider store={store}>
      <CustomPostHogProvider>
        <App vscodeAPI={getVSCodeAPI()} />
      </CustomPostHogProvider>
    </Provider>
  </StrictMode>
);

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<Root />);
