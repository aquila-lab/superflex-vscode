import React, { useState } from 'react';

import { VSCodeWrapper } from '../api/vscodeApi';
import { Button } from '../components/ui/Button';
import ChatView from './ChatView';
import ProfileView from './ProfileView';

const MainView: React.FunctionComponent<{
  vscodeAPI: Pick<VSCodeWrapper, 'postMessage' | 'onMessage'>;
}> = ({ vscodeAPI }) => {
  const [activeView, setActiveView] = useState<'chat' | 'profile'>('chat');

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
      </div>

      <div className="flex-grow overflow-auto text-left">
        {activeView === 'chat' && <ChatView vscodeAPI={vscodeAPI} />}
        {activeView === 'profile' && <ProfileView vscodeAPI={vscodeAPI} />}
      </div>
    </div>
  );
};

export default MainView;
