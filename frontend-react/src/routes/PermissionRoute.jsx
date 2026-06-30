import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function PermissionRoute({ permission }) {
    const { user } = useAuthStore();
    
    if (user?.roles?.includes('Superadmin')) {
        return <Outlet />;
    }

    if (!permission || user?.permissions?.includes(permission)) {
        return <Outlet />;
    }

    // Redirect to dashboard if no permission
    return <Navigate to="/" replace />;
}
