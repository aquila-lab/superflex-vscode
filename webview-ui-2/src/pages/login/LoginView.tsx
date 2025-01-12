import { useEffect, useState } from 'react';
import { useVSCode } from '../../context/VSCodeContext';
import { EventType, EventPayloads } from '../../../../shared/protocol';
import { LoginAuthLinkView } from './LoginAuthLinkView';
import { LoginDefaultView } from './LoginDefaultView';

export const LoginView = () => {
  const { postRequest } = useVSCode();
  const [authUniqueLink, setAuthUniqueLink] = useState<string | undefined>();

  useEffect(() => {
    const onMessage = (evt: MessageEvent) => {
      const { command, payload, error } = evt.data || {};
      if (command === EventType.CREATE_AUTH_LINK && !error) {
        const auth = payload as EventPayloads[EventType.CREATE_AUTH_LINK]['response'];
        setAuthUniqueLink(auth.uniqueLink);
      }
    };

    window.addEventListener('message', onMessage as EventListener);
    return () => {
      window.removeEventListener('message', onMessage as EventListener);
    };
  }, []);

  if (authUniqueLink) {
    return (
      <LoginAuthLinkView
        authUniqueLink={authUniqueLink}
        onCopyLink={() => {
          navigator.clipboard.writeText(authUniqueLink);
          postRequest(EventType.SEND_NOTIFICATION, { message: 'Link copied to clipboard' });
        }}
        onReturnToLogin={() => setAuthUniqueLink(undefined)}
      />
    );
  }

  return <LoginDefaultView onRequest={postRequest} />;
};
