import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show a loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-spinner" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // If not logged in or not admin, redirect to home
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If admin, render the child components
  return children;
};

export default AdminRoute;