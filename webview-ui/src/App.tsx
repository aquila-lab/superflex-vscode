import './App.css';

import React, { useEffect, useState } from 'react';

import { newEventMessage } from '../../shared/protocol';
import views from './views';
import { VSCodeWrapper } from './api/vscodeApi';

type View = keyof typeof views;

const App: React.FunctionComponent<{ vscodeAPI: VSCodeWrapper }> = ({ vscodeAPI }) => {
  const [view, setView] = useState<View>('login');

  useEffect(() => {
    return vscodeAPI.onMessage((message) => {
      switch (message.command) {
        case 'show_login_view':
          setView('login');
          break;
        case 'show_chat_view':
          setView('chat');
          break;
        case 'initialized':
          if (!message.data.isInitialized) {
            setView('openProjectPrompt');
            return;
          }

          setView('chat');
          break;
      }
    });
  }, [vscodeAPI]);

  useEffect(() => {
    // Notify the extension host that we are ready to receive events
    vscodeAPI.postMessage(newEventMessage('ready'));
  }, [vscodeAPI]);

  const SelectedView = views[view];

  return (
    <div className="App h-full">
      <div id="AppContent" className="h-full">
        <SelectedView vscodeAPI={vscodeAPI} />
      </div>
    </div>
  );
};

export default App;
