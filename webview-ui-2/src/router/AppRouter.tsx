import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavigationLayout } from '../layouts/NavigationLayout';
import { Layout } from '../layouts/Layout';
import { AuthGuard } from './AuthGuard';
import { AlreadyLoggedInGuard } from './AlreadyLoggedInGuard';
import { ExtensionEventHandler } from '../components/ExtensionEventHandler';
import { LoginView } from '../pages/login/LoginView';
import ProfileView from '../pages/profile/ProfileView';
import { ChatView } from '../pages/chat/ChatView';
import { AuthenticatedProviders } from '../components/AuthenticatedProviders';

const OpenProject = () => <div>Open Project</div>;

export const AppRouter = () => {
  return (
    <MemoryRouter>
      <ExtensionEventHandler />

      <Routes>
        <Route element={<AlreadyLoggedInGuard />}>
          <Route element={<Layout />}>
            <Route path="/login" element={<LoginView />} />
          </Route>
        </Route>

        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/open-project" element={<OpenProject />} />
          </Route>
        </Route>

        <Route element={<AuthGuard />}>
          <Route path="/" element={<AuthenticatedProviders />}>
            <Route element={<NavigationLayout />}>
              <Route index element={<ChatView />} />
              <Route path="chat" element={<ChatView />} />
              <Route path="profile" element={<ProfileView />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </MemoryRouter>
  );
};
