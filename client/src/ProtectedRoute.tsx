import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const auth = useAuth();

  if (!auth) return null;
  const { user } = auth;
  if (!user) {
    // Not logged in: redirect to login
    return <Navigate to="/login" replace />;
  }
  // Logged in: render the child route component
  return <Outlet />;
};

export default ProtectedRoute;
