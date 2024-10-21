import React, { useEffect, useState } from 'react';

import { EventMessage, EventPayloads, EventType, newEventRequest } from '../../../shared/protocol';
import { VSCodeWrapper } from '../api/vscodeApi';
import { Button } from '../components/ui/Button';

type LoginViewProps = {
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
};

const LoginView: React.FunctionComponent<LoginViewProps> = ({ vscodeAPI }: LoginViewProps) => {
  const [authUniqueLink, setAuthUniqueLink] = useState<string>();

  useEffect(() => {
    return vscodeAPI.onMessage((message: EventMessage<EventType>) => {
      const { command, payload, error } = message;

      switch (command) {
        case EventType.CREATE_AUTH_LINK: {
          if (error) {
            return;
          }

          const auth = payload as EventPayloads[typeof command]['response'];
          setAuthUniqueLink(auth.uniqueLink);
          break;
        }
      }
    });
  }, [vscodeAPI]);

  if (authUniqueLink) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-5 pb-4">
        <div className="flex flex-col items-center justify-center gap-3 max-w-md">
          <h3 className="text-lg font-bold">
            If you are not redirected to the webpage, copy this link to your browser:
          </h3>
          <p className="text-center text-muted-foreground truncate max-w-72">{authUniqueLink}</p>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(authUniqueLink);
              vscodeAPI.postMessage(
                newEventRequest(EventType.SEND_NOTIFICATION, { message: 'Link copied to clipboard' })
              );
            }}>
            Copy Link
          </Button>

          <Button className="mt-4" variant={'link'} onClick={() => setAuthUniqueLink(undefined)}>
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between items-center h-full px-5 pb-4">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md h-full">
        <h3 className="text-2xl font-bold mb-2">Welcome to Superflex!</h3>
        <p className="text-center text-muted-foreground mb-4">Your one-stop solution for all your development needs!</p>

        <Button
          className="w-full mb-4"
          onClick={() => {
            vscodeAPI.postMessage(newEventRequest(EventType.LOGIN_CLICKED));
            vscodeAPI.postMessage(newEventRequest(EventType.CREATE_AUTH_LINK, { action: 'login' }));
          }}>
          Sign In
        </Button>

        <p className="text-muted-foreground">Don&apos;t have an account?</p>
        <Button
          variant={'link'}
          onClick={() => {
            vscodeAPI.postMessage(newEventRequest(EventType.CREATE_ACCOUNT_CLICKED));
            vscodeAPI.postMessage(newEventRequest(EventType.CREATE_AUTH_LINK, { action: 'create_account' }));
          }}>
          Create free account
        </Button>
      </div>

      <div className="flex flex-col items-center gap-3 mb-8">
        <p className="text-lg font-semibold">Watch our onboarding video:</p>
        <div className="w-full">
          <iframe
            className="w-full aspect-video border border-border rounded-lg shadow-sm"
            src="https://www.youtube.com/embed/hNSYwKTxIP8?si=8C9RVdflePElLhJx"
            title="Superflex Onboarding Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen></iframe>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
