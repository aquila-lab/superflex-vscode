import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventResponseType, EventResponsePayload, TypedEventResponseMessage } from '../../../shared/protocol';
import { useGlobal } from '../context/GlobalContext';
import { useConsumeMessage } from '../hooks/useConsumeMessage';

export const ExtensionEventHandler = () => {
  const navigate = useNavigate();
  const { setIsInitialized, setIsLoggedIn, setConfig, setIsFigmaAuthenticated } = useGlobal();

  const handleConfig = useCallback(
    (payload: EventResponsePayload[EventResponseType.CONFIG]) => {
      setConfig(payload);
    },
    [setConfig]
  );

  const handleInitialized = useCallback(
    (payload: EventResponsePayload[EventResponseType.INITIALIZED]) => {
      const { isFigmaAuthenticated, isInitialized } = payload;

      setIsFigmaAuthenticated(isFigmaAuthenticated);
      setIsInitialized(true);

      if (!isInitialized) {
        navigate('/open-project');
        return;
      }

      navigate('/chat');
    },
    [navigate, setIsFigmaAuthenticated, setIsInitialized]
  );

  const handleConnectFigma = useCallback(
    (payload: EventResponsePayload[EventResponseType.FIGMA_OAUTH_CONNECT]) => {
      if (payload) {
        setIsFigmaAuthenticated(true);
      }
    },
    [navigate, setIsFigmaAuthenticated, setIsInitialized]
  );

  const handleShowLoginView = useCallback(() => {
    setIsLoggedIn(false);
  }, [setIsLoggedIn]);

  const handleShowChatView = useCallback(() => {
    setIsLoggedIn(true);
  }, [setIsLoggedIn]);

  const handleMessage = useCallback(
    ({ command, payload }: TypedEventResponseMessage) => {
      switch (command) {
        case EventResponseType.CONFIG: {
          handleConfig(payload);
          break;
        }
        case EventResponseType.INITIALIZED: {
          handleInitialized(payload);
          break;
        }
        case EventResponseType.SHOW_LOGIN_VIEW: {
          handleShowLoginView();
          break;
        }
        case EventResponseType.FIGMA_OAUTH_CONNECT: {
          handleConnectFigma(payload);
          break;
        }
        case EventResponseType.SHOW_CHAT_VIEW: {
          handleShowChatView();
          break;
        }
      }
    },
    [handleConfig, handleInitialized, handleShowLoginView, handleShowChatView]
  );

  useConsumeMessage(
    [
      EventResponseType.CONFIG,
      EventResponseType.INITIALIZED,
      EventResponseType.SHOW_LOGIN_VIEW,
      EventResponseType.SHOW_CHAT_VIEW
    ],
    handleMessage
  );

  return null;
};
