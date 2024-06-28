import './App.css';

import React, { useEffect, useState } from 'react';

import Chat from './Chat';
import { VSCodeWrapper } from './api/vscodeApi';
import { newEventMessage } from './api/protocol';

type View = 'chat' | 'login';

const App: React.FunctionComponent<{ vscodeAPI: VSCodeWrapper }> = ({ vscodeAPI }) => {
  const [view, setView] = useState<View>('chat');

  useEffect(
    () =>
      vscodeAPI.onMessage((message) => {
        console.log('message', message);
      }),
    [view, vscodeAPI]
  );

  useEffect(() => {
    // Notify the extension host that we are ready to receive events
    vscodeAPI.postMessage(newEventMessage('ready'));
  }, [vscodeAPI]);

  if (view === 'login') {
    return <div>Need to login!</div>;
  }

  return (
    <div className="App h-full">
      <div id="AppContent" className="h-full">
        <Chat vscodeAPI={vscodeAPI} />
      </div>
    </div>
  );
};

export default App;
