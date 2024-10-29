import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import React, { PropsWithChildren, useEffect } from 'react';
import { IS_PROD, SUPERFLEX_POSTHOG_API_KEY } from '../../../shared/common/constants';

const CustomPostHogProvider = ({ children }: PropsWithChildren) => {
  const [client, setClient] = React.useState<any>(undefined);

  useEffect(() => {
    if (IS_PROD && SUPERFLEX_POSTHOG_API_KEY) {
      posthog.init(SUPERFLEX_POSTHOG_API_KEY, {
        api_host: 'https://app.posthog.com',
        disable_session_recording: true,
        autocapture: false,
        capture_pageleave: false,
        capture_pageview: false
      });
      //   posthog.identify(window.vscMachineId);
      //   posthog.opt_in_capturing();
      setClient(client);
    } else {
      setClient(undefined);
    }
  }, []);

  return <PostHogProvider client={client}>{children}</PostHogProvider>;
};

export default CustomPostHogProvider;
