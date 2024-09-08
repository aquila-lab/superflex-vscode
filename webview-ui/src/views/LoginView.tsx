import React from 'react';

import { newEventMessage } from '../../../shared/protocol';
import { VSCodeWrapper } from '../api/vscodeApi';
import { Button } from '../components/ui/Button';

type LoginViewProps = {
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
};

const LoginView: React.FunctionComponent<LoginViewProps> = ({ vscodeAPI }: LoginViewProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-full px-5 pb-4">
      <h3 className="text-2xl font-bold mb-4">Welcome to Superflex!</h3>
      <Button onClick={() => vscodeAPI.postMessage(newEventMessage('login_clicked'))}>Sign in</Button>
    </div>
  );
};

export default LoginView;
