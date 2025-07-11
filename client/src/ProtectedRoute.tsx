import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useUserSettings } from './context/UserSettingsContext';

const ProtectedRoute: React.FC = () => {
  const auth = useAuth();
  const {settings} = useUserSettings();

  if (!settings) return null;
const user = settings.userName;
  if (!user) {
    // Not logged in: redirect to login
    return <Navigate to="/login" replace />;
  }
  // Logged in: render the child route component
  return <Outlet />;
};

export default ProtectedRoute;
