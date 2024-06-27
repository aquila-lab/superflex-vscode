import React from 'react';

import { VSCodeWrapper } from './api/vscode-api';

const Chat: React.FunctionComponent<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}> = ({ vscodeAPI }) => {
  return <div>Chat</div>;
};

export default Chat;
