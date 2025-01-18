import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { useUser } from '../context/UserContext';

export const NavBar = () => {
  const location = useLocation();
  const { subscription, handleSubscribe } = useUser();
  const currentPath = location.pathname.split('/')[1] || 'chat';

  if (!subscription) return null;

  const showUpgradeButton = subscription.plan?.name.toLowerCase().includes('free');

  return (
    <div className="flex justify-end p-1">
      <Button size="xs" variant={currentPath === 'chat' ? 'secondary' : 'text'} asChild>
        <Link to="/chat" className='block'>Chat</Link>
      </Button>
      <Button size="xs" variant={currentPath === 'profile' ? 'secondary' : 'text'} asChild>
        <Link to="/profile" className='block'>Profile</Link>
      </Button>
      {showUpgradeButton && (
        <Button size="xs" className="ml-1" onClick={handleSubscribe}>
          Upgrade
        </Button>
      )}
    </div>
  );
};
