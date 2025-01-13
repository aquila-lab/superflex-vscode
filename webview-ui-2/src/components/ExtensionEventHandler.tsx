import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { EventResponseType, EventResponseMessage, EventResponsePayload } from '../../../shared/protocol';
import { useGlobal } from '../context/GlobalContext';

export const ExtensionEventHandler = () => {
  const navigate = useNavigate();

  const { setIsInitialized, setIsLoggedIn, setConfig, setIsFigmaAuthenticated } = useGlobal();

  useEffect(() => {
    const onMessage = (evt: MessageEvent<EventResponseMessage<EventResponseType>>) => {
      const { command, payload, error } = evt.data || {};

      if (error) return;

      switch (command) {
        case EventResponseType.CONFIG: {
          const config = payload as EventResponsePayload[typeof command];
          setConfig(config);
          break;
        }

        case EventResponseType.INITIALIZED: {
          const { isFigmaAuthenticated, isInitialized } = payload as EventResponsePayload[typeof command];

          setIsFigmaAuthenticated(isFigmaAuthenticated);
          setIsInitialized(true);

          if (!isInitialized) {
            navigate('/open-project');
            return;
          }

          navigate('/chat');
          break;
        }

        case EventResponseType.SHOW_LOGIN_VIEW: {
          setIsLoggedIn(false);
          break;
        }

        case EventResponseType.SHOW_CHAT_VIEW: {
          setIsLoggedIn(true);
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('message', onMessage as EventListener);
    return () => {
      window.removeEventListener('message', onMessage as EventListener);
    };
  }, [navigate, setConfig, setIsInitialized, setIsLoggedIn]);

  return null;
};
