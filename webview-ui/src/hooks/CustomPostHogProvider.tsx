import React, { PropsWithChildren, useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

import { SUPERFLEX_POSTHOG_API_KEY } from '../../../shared/common/constants';
import { useAppSelector } from '../core/store';

const CustomPostHogProvider = ({ children }: PropsWithChildren) => {
  const allowAnonymousTelemetry = useAppSelector((state) => state.config.allowAnonymousTelemetry);

  useEffect(() => {
    if (allowAnonymousTelemetry) {
      posthog.init(SUPERFLEX_POSTHOG_API_KEY, {
        api_host: 'https://app.posthog.com',
        disable_session_recording: true,
        autocapture: false,
        capture_pageleave: false,
        capture_pageview: false
      });
      posthog.opt_in_capturing();
    }
  }, [allowAnonymousTelemetry]);

  return allowAnonymousTelemetry ? <PostHogProvider>{children}</PostHogProvider> : <>{children}</>;
};

export default CustomPostHogProvider;
