import { Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-white p-4">
      <Outlet />
    </div>
  );
};
