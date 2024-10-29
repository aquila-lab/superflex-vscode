import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
// import posthog from 'posthog-js';

import './index.css';
import App from './App';
import store from './core/store';
import { getVSCodeAPI } from './api/vscodeApi';
import CustomPostHogProvider from './hooks/CustomPostHogProvider';
// import { IS_PROD, SUPERFLEX_POSTHOG_API_KEY } from '../../shared/common/constants';

// if (IS_PROD && SUPERFLEX_POSTHOG_API_KEY) {
//    posthog.init(SUPERFLEX_POSTHOG_API_KEY, { api_host: 'https://app.posthog.com' ,
//       disable_session_recording: true,
//         autocapture: false,
//         // // We need to manually track pageviews since we're a SPA
//         capture_pageleave: false,
//         capture_pageview: false,
//   });
//
// }

const Root = (): JSX.Element => (
  <StrictMode>
    <Provider store={store}>
      <CustomPostHogProvider />
      <App vscodeAPI={getVSCodeAPI()} />
      <CustomPostHogProvider />
    </Provider>
  </StrictMode>
);

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<Root />);
