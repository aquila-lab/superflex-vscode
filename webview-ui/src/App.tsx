import './App.css';

import React, { useEffect, useState } from 'react';

import {
  EventRequestType,
  EventResponseMessage,
  EventResponsePayload,
  EventResponseType,
  newEventRequest
} from '../../shared/protocol';
import views from './views';
import { useAppDispatch } from './core/store';
import { configActions } from './core/actions';
import { VSCodeWrapper } from './api/vscodeApi';

type View = keyof typeof views;

const App: React.FunctionComponent<{ vscodeAPI: VSCodeWrapper }> = ({ vscodeAPI }) => {
  const dispatch = useAppDispatch();

  const [view, setView] = useState<View>('login');

  useEffect(() => {
    return vscodeAPI.onMessage((message: EventResponseMessage<EventResponseType>) => {
      const { command, payload, error } = message;

      switch (command) {
        case EventResponseType.CONFIG: {
          if (error) return;

          const config = payload as EventResponsePayload[typeof command];
          dispatch(configActions.setConfig(config));
          break;
        }
        case EventResponseType.SHOW_LOGIN_VIEW: {
          setView('login');
          break;
        }
        case EventResponseType.INITIALIZED: {
          if (error) return;

          const initState = payload as EventResponsePayload[typeof command];

          if (!initState.isInitialized) {
            setView('openProjectPrompt');
            return;
          }

          setView('main');
          break;
        }
        case EventResponseType.SHOW_CHAT_VIEW: {
          setView('main');
          break;
        }
      }
    });
  }, [vscodeAPI]);

  useEffect(() => {
    // Notify the extension host that we are ready to receive events
    vscodeAPI.postMessage(newEventRequest(EventRequestType.READY));
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
