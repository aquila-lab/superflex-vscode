import React, { useState } from 'react';

import { EventType, newEventRequest } from '../../../shared/protocol';
import { useAppSelector } from '../core/store';
import { VSCodeWrapper } from '../api/vscodeApi';
import { Button } from '../components/ui/Button';
import ChatView from './ChatView';
import ProfileView from './ProfileView';

const MainView: React.FunctionComponent<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}> = ({ vscodeAPI }) => {
  const user = useAppSelector((state) => state.user);

  const [activeView, setActiveView] = useState<'chat' | 'profile'>('chat');

  function handleSubscribe(): void {
    vscodeAPI.postMessage(newEventRequest(EventType.OPEN_EXTERNAL_URL, { url: 'https://app.superflex.ai/pricing' }));
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-1">
        <Button size="xs" variant={activeView === 'chat' ? 'secondary' : 'text'} onClick={() => setActiveView('chat')}>
          Chat
        </Button>
        <Button
          size="xs"
          variant={activeView === 'profile' ? 'secondary' : 'text'}
          onClick={() => setActiveView('profile')}>
          Profile
        </Button>
        {user?.subscription?.plan?.name.toLowerCase().includes('free') && (
          <Button size="xs" className="ml-1" onClick={handleSubscribe}>
            Upgrade
          </Button>
        )}
      </div>

      <div className="flex-grow overflow-auto text-left">
        {activeView === 'chat' && <ChatView vscodeAPI={vscodeAPI} />}
        {activeView === 'profile' && <ProfileView vscodeAPI={vscodeAPI} />}
      </div>
    </div>
  );
};

export default MainView;
