import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App';
import { getVSCodeAPI } from './api/vscode-api';

const Root = (): JSX.Element => (
  <StrictMode>
    <App vscodeAPI={getVSCodeAPI()} />
  </StrictMode>
);

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<Root />);
