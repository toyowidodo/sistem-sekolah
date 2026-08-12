import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AccessLoading from './AccessLoading';

export default function SuperadminRoute() {
    const { user, isAuthenticated, userLoaded } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // Wait for user data to load
    if (!userLoaded) return <AccessLoading />;

    // Check if user has Superadmin role
    if (user?.roles?.includes('Superadmin')) {
        return <Outlet />;
    }

    // Redirect non-superadmins back to dashboard
    return <Navigate to="/" replace />;
}
