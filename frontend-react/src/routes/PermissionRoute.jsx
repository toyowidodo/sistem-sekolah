import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AccessLoading from './AccessLoading';

export default function PermissionRoute({ permission }) {
    const { user, isAuthenticated, userLoaded } = useAuthStore();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // Tunggu data user selesai dimuat sebelum menilai permission
    if (!userLoaded) return <AccessLoading />;

    if (user?.roles?.includes('Superadmin')) {
        return <Outlet />;
    }

    if (!permission || user?.permissions?.includes(permission)) {
        return <Outlet />;
    }

    // Redirect to dashboard if no permission
    return <Navigate to="/" replace />;
}
