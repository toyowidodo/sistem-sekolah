import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Jika tidak punya token, tendang ke /login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Jika punya token, biarkan masuk ke layout/dashboard
    return <Outlet />;
}