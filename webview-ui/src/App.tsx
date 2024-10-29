import './App.css';

import React, { useEffect, useState } from 'react';

import { EventMessage, EventPayloads, EventType, newEventRequest } from '../../shared/protocol';
import views from './views';
import { useAppDispatch } from './core/store';
import { configActions } from './core/actions';
import { VSCodeWrapper } from './api/vscodeApi';

type View = keyof typeof views;

const App: React.FunctionComponent<{ vscodeAPI: VSCodeWrapper }> = ({ vscodeAPI }) => {
  const dispatch = useAppDispatch();

  const [view, setView] = useState<View>('login');

  useEffect(() => {
    return vscodeAPI.onMessage((message: EventMessage<EventType>) => {
      const { command, payload, error } = message;

      switch (command) {
        case EventType.CONFIG: {
          if (error) return;

          const config = payload as EventPayloads[typeof command]['request'];
          dispatch(configActions.setConfig(config));
          break;
        }
        case EventType.SHOW_LOGIN_VIEW: {
          setView('login');
          break;
        }
        case EventType.INITIALIZED: {
          if (error) return;

          const initState = payload as EventPayloads[typeof command]['response'];

          if (!initState.isInitialized) {
            setView('openProjectPrompt');
            return;
          }

          setView('main');
          break;
        }
        case EventType.SHOW_CHAT_VIEW: {
          setView('main');
          break;
        }
      }
    });
  }, [vscodeAPI]);

  useEffect(() => {
    // Notify the extension host that we are ready to receive events
    vscodeAPI.postMessage(newEventRequest(EventType.READY));
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
