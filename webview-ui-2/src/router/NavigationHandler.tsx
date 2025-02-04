import { useNavigate } from 'react-router-dom';
import { TypedEventResponseMessage, EventResponseType, EventRequestType } from '../../../shared/protocol';
import { useGlobal } from '../context/GlobalContext';
import { useConsumeMessage } from '../hooks/useConsumeMessage';
import { useEffect } from 'react';
import { usePostMessage } from '../hooks/usePostMessage';

export const NavigationHandler = () => {
  const postMessage = usePostMessage();
  const navigate = useNavigate();
  const { setIsLoggedIn } = useGlobal();

  useEffect(() => {
    postMessage(EventRequestType.READY);
  }, [postMessage]);

  const handleMessage = ({ command }: TypedEventResponseMessage) => {
    switch (command) {
      case EventResponseType.SHOW_LOGIN_VIEW: {
        setIsLoggedIn(false);
        navigate('/login', { replace: true });
        break;
      }
      case EventResponseType.SHOW_CHAT_VIEW: {
        setIsLoggedIn(true);
        navigate('/chat', { replace: true });
        break;
      }
      case EventResponseType.SHOW_SETTINGS_VIEW: {
        navigate('/profile', { replace: true });
        break;
      }
    }
  };

  useConsumeMessage(
    [EventResponseType.SHOW_LOGIN_VIEW, EventResponseType.SHOW_CHAT_VIEW, EventResponseType.SHOW_SETTINGS_VIEW],
    handleMessage
  );

  return null;
};
