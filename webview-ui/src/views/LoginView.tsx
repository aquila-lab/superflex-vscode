import React, { useEffect, useState } from 'react';

import {
  EventRequestType,
  EventResponseMessage,
  EventResponsePayload,
  EventResponseType,
  newEventRequest
} from '../../../shared/protocol';
import { VSCodeWrapper } from '../api/vscodeApi';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';

type LoginViewProps = {
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
};

const LoginView: React.FunctionComponent<LoginViewProps> = ({ vscodeAPI }: LoginViewProps) => {
  const [authUniqueLink, setAuthUniqueLink] = useState<string>();

  useEffect(() => {
    return vscodeAPI.onMessage((message: EventResponseMessage<EventResponseType>) => {
      const { command, payload, error } = message;

      switch (command) {
        case EventResponseType.CREATE_AUTH_LINK: {
          if (error) {
            return;
          }

          const auth = payload as EventResponsePayload[typeof command];
          setAuthUniqueLink(auth.uniqueLink);
          break;
        }
      }
    });
  }, [vscodeAPI]);

  if (authUniqueLink) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-5 pb-4">
        <Card className="max-w-md my-auto">
          <CardHeader className="flex justify-center items-center">
            <CardTitle className="text-lg font-semibold">
              If you are not redirected to the webpage, copy this link to your browser:
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center">
            <CardDescription className="text-center text-muted-foreground truncate max-w-72">
              {authUniqueLink}
            </CardDescription>

            <Button
              className="mt-4"
              onClick={() => {
                navigator.clipboard.writeText(authUniqueLink);
                vscodeAPI.postMessage(
                  newEventRequest(EventRequestType.SEND_NOTIFICATION, { message: 'Link copied to clipboard' })
                );
              }}>
              Copy Link
            </Button>
          </CardContent>

          <CardFooter className="flex justify-center items-center">
            <Button variant={'link'} onClick={() => setAuthUniqueLink(undefined)}>
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-5 pb-4">
      <Card className="max-w-md my-auto">
        <CardHeader className="flex justify-center items-center">
          <img src={window.superflexLogoUri} alt="Superflex Logo" className="size-12" />
          <CardTitle>Welcome to Superflex!</CardTitle>
          <CardDescription>Your Frontend Engineering Assistant.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center">
          <Button
            className="w-full"
            onClick={() => {
              vscodeAPI.postMessage(newEventRequest(EventRequestType.CREATE_ACCOUNT));
              vscodeAPI.postMessage(newEventRequest(EventRequestType.CREATE_AUTH_LINK, { action: 'create_account' }));
            }}>
            Start for Free
          </Button>

          <p className="text-muted-foreground mt-4">Already have an account?</p>
          <Button
            variant={'link'}
            onClick={() => {
              vscodeAPI.postMessage(newEventRequest(EventRequestType.SIGN_IN));
              vscodeAPI.postMessage(newEventRequest(EventRequestType.CREATE_AUTH_LINK, { action: 'login' }));
            }}>
            Sign In
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-3 mt-auto mb-8">
        <p className="text-lg font-semibold">Watch our onboarding video:</p>
        <div
          className="w-full cursor-pointer relative"
          onClick={() =>
            vscodeAPI.postMessage(
              newEventRequest(EventRequestType.OPEN_EXTERNAL_URL, {
                url: 'https://www.youtube.com/watch?v=hNSYwKTxIP8'
              })
            )
          }>
          <div className="absolute inset-0 z-10"></div>
          <iframe
            className="w-full aspect-video border border-border rounded-lg shadow-sm"
            src="https://www.youtube.com/embed/hNSYwKTxIP8?si=8C9RVdflePElLhJx"
            title="Superflex Onboarding Video"
            frameBorder="0"
            sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen></iframe>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
