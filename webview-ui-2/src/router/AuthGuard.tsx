import { Outlet, Navigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

export const AuthGuard = () => {
  const { isLoggedIn } = useGlobal();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
