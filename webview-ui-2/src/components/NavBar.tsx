import { Link } from 'react-router-dom';
import { Button } from './ui/Button';

export const NavBar = () => {
  return (
    <nav className="flex items-center justify-between bg-gray-800 px-4 py-2">
      <div className="text-xl font-bold">Superflex</div>
      <div className="space-x-4">
        <Link to="/chat" className="text-white hover:text-gray-300">
          Chat
        </Link>
        <Link to="/profile" className="text-white hover:text-gray-300">
          Profile
        </Link>
      </div>
      <Button>Upgrade</Button>
    </nav>
  );
};
