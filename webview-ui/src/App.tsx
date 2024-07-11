import './App.css';

import React, { useEffect, useState } from 'react';

import Chat from './Chat';
import { VSCodeWrapper } from './api/vscodeApi';
import { newEventMessage } from './api/protocol';
import { Button } from './components';

type View = 'chat' | 'login' | 'no_open_project';

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
          if (!message.data) {
            setView('no_open_project');
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

  if (view === 'login') {
    return (
      <div className="App h-full">
        <div id="AppContent" className="h-full">
          <div className="flex flex-col justify-center items-center h-full vscode-dark text-white px-3 pb-4">
            <h1 className="text-2xl font-bold mb-4">Welcome to Element AI!</h1>
            <Button onClick={() => vscodeAPI.postMessage(newEventMessage('login_clicked'))}>Sign in</Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'no_open_project') {
    return (
      <div className="App h-full">
        <div id="AppContent" className="h-full">
          <div className="flex flex-col justify-center items-center h-full vscode-dark text-white px-3 pb-4">
            <h1 className="text-2xl font-bold mb-4">No open project</h1>
            <p className="text-center">
              Please open a project to start using Element AI. If you have already opened a project, and still see this.
              Please restart Visual Studio Code.
            </p>
          </div>
        </div>
      </div>
    );
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
