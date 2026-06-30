import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function SuperadminRoute() {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    // Wait for user data to load
    if (!user) return <div className="p-10 flex justify-center"><p className="text-sm text-gray-500">Memuat akses...</p></div>;

    // Check if user has Superadmin role
    if (user.roles && user.roles.includes('Superadmin')) {
        return <Outlet />;
    }

    // Redirect non-superadmins back to dashboard
    return <Navigate to="/" replace />;
}
