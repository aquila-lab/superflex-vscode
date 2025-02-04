import { useState, useCallback } from 'react';
import { usePostMessage } from '../../hooks/usePostMessage';
import { useConsumeMessage } from '../../hooks/useConsumeMessage';
import { EventRequestType, EventResponseType, EventResponseMessage } from '../../../../shared/protocol';
import { LoginAuthLinkView } from './LoginAuthLinkView';
import { LoginDefaultView } from './LoginDefaultView';

export const LoginView = () => {
  const postMessage = usePostMessage();
  const [authUniqueLink, setAuthUniqueLink] = useState<string | undefined>();

  const handleAuthLink = useCallback(({ payload }: EventResponseMessage<EventResponseType.CREATE_AUTH_LINK>) => {
    setAuthUniqueLink(payload.uniqueLink);
  }, []);

  useConsumeMessage(EventResponseType.CREATE_AUTH_LINK, handleAuthLink);

  const handleCopyLink = useCallback(() => {
    if (authUniqueLink) {
      navigator.clipboard.writeText(authUniqueLink);
      postMessage(EventRequestType.SEND_NOTIFICATION, { message: 'Link copied to clipboard' });
    }
  }, [authUniqueLink, postMessage]);

  const handleReturnToLogin = useCallback(() => {
    setAuthUniqueLink(undefined);
  }, []);

  if (authUniqueLink) {
    return (
      <LoginAuthLinkView
        authUniqueLink={authUniqueLink}
        onCopyLink={handleCopyLink}
        onReturnToLogin={handleReturnToLogin}
      />
    );
  }

  return <LoginDefaultView />;
};
