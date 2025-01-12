import { Outlet } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { UserProvider } from '../context/UserContext';

export const AuthenticatedLayout = () => {
  return (
    <UserProvider>
      <div className="flex flex-col h-full w-full">
        <NavBar />
        <div className="flex-1 overflow-auto bg-gray-900 text-white p-4">
          <Outlet />
        </div>
      </div>
    </UserProvider>
  );
};
