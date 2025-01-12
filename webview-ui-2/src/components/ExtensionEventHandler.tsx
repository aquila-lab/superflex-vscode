import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { EventMessage, EventType, EventPayloads } from '../../../shared/protocol';

export const ExtensionEventHandler = () => {
  const { setIsInitialized, setIsLoggedIn, setConfig, setIsFigmaAuthenticated } = useGlobal();
  const navigate = useNavigate();

  useEffect(() => {
    const onMessage = (evt: MessageEvent<EventMessage<EventType>>) => {
      const { command, payload, error } = evt.data || {};
      if (!command) return;

      switch (command) {
        case EventType.CONFIG: {
          if (!error && payload) {
            setConfig(payload as Record<string, unknown>);
          }
          break;
        }

        case EventType.INITIALIZED: {
          if (error) return;
          const { isFigmaAuthenticated, isInitialized} = payload as EventPayloads[EventType.INITIALIZED]["response"];
          setIsFigmaAuthenticated(isFigmaAuthenticated);
          setIsInitialized(true);

          if (!isInitialized) {
            navigate("/open-project");
            return;
          }
          
          navigate("/chat");
          break;
        }

        case EventType.SHOW_LOGIN_VIEW: {
          setIsLoggedIn(false);
          break;
        }

        case EventType.SHOW_CHAT_VIEW: {
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
  }, [setConfig, setIsInitialized, setIsLoggedIn, navigate]);

  return null;
};
