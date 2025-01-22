import { Outlet } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { SharedLayout } from './SharedLayout';

export const NavigationLayout = () => {
  return (
    <SharedLayout>
      <div className="flex flex-col h-full">
        <NavBar />
        <Outlet />
      </div>
    </SharedLayout>
  );
};
