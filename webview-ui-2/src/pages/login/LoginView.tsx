import { useEffect, useState } from 'react';
import { useVSCode } from '../../context/VSCodeContext';
import {
  EventRequestType,
  EventResponseType,
  EventResponsePayload,
  EventResponseMessage
} from '../../../../shared/protocol';
import { LoginAuthLinkView } from './LoginAuthLinkView';
import { LoginDefaultView } from './LoginDefaultView';

export const LoginView = () => {
  const { postMessage } = useVSCode();
  const [authUniqueLink, setAuthUniqueLink] = useState<string | undefined>();

  useEffect(() => {
    const onMessage = (evt: MessageEvent<EventResponseMessage<EventResponseType>>) => {
      const { command, payload, error } = evt.data || {};

      if (error) return;

      switch (command) {
        case EventResponseType.CREATE_AUTH_LINK: {
          const auth = payload as EventResponsePayload[typeof command];
          setAuthUniqueLink(auth.uniqueLink);
          break;
        }
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
          postMessage(EventRequestType.SEND_NOTIFICATION, { message: 'Link copied to clipboard' });
        }}
        onReturnToLogin={() => setAuthUniqueLink(undefined)}
      />
    );
  }

  return <LoginDefaultView />;
};
