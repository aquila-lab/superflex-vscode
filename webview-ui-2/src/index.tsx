import './index.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StrictMode } from 'react';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
