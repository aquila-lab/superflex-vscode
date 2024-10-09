import React from 'react';

import { EventType, newEventRequest } from '../../../shared/protocol';
import { VSCodeWrapper } from '../api/vscodeApi';
import { Button } from '../components/ui/Button';

type LoginViewProps = {
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
};

const LoginView: React.FunctionComponent<LoginViewProps> = ({ vscodeAPI }: LoginViewProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-full max-w-md px-5 pb-4">
      <h3 className="text-2xl font-bold mb-2">Welcome to Superflex!</h3>
      <p className="text-center text-muted-foreground mb-4">Your one-stop solution for all your development needs!</p>

      <Button className="w-full mb-4" onClick={() => vscodeAPI.postMessage(newEventRequest(EventType.LOGIN_CLICKED))}>
        Sign In
      </Button>

      <p className="text-muted-foreground">Don&apos;t have an account?</p>
      <Button variant={'link'} onClick={() => vscodeAPI.postMessage(newEventRequest(EventType.CREATE_ACCOUNT_CLICKED))}>
        Create free account
      </Button>
    </div>
  );
};

export default LoginView;
