import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import Teachers from '../pages/Teachers';
import Payments from '../pages/Payments';
import Attendance from '../pages/Attendance';
import Announcements from '../pages/Announcements';
import Academic from '../pages/Academic';
import AdminPanel from '../pages/AdminPanel';
import Grades from '../pages/Grades';
import Profile from '../pages/Profile';
import SPP from '../pages/SPP';
import AcademicCalendar from '../pages/AcademicCalendar';
import Inventory from '../pages/Inventory';
import EOffice from '../pages/EOffice';
import StudentPoints from '../pages/StudentPoints';
import Login from '../pages/Login';
import ProtectedRoute from './ProtectedRoute';
import SuperadminRoute from './SuperadminRoute';
import StudentDashboard from '../pages/StudentPortal/StudentDashboard';
import StudentSPP from '../pages/StudentPortal/StudentSPP';
import StudentGrades from '../pages/StudentPortal/StudentGrades';
import StudentSchedules from '../pages/StudentPortal/StudentSchedules';

import { useAuthStore } from '../store/authStore';
import PermissionRoute from './PermissionRoute';

export default function AppRoutes() {
    const user = useAuthStore(state => state.user);
    const isSiswa = user?.roles?.includes('Siswa');

    return (
        <BrowserRouter>
            <Routes>
                {/* Halaman Login (Bebas Akses) */}
                <Route path="/login" element={<Login />} />
                
                {/* Halaman yang Diproteksi (Wajib Login) */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/" element={isSiswa ? <StudentDashboard /> : <Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/calendar" element={<AcademicCalendar />} />
                        <Route path="/announcements" element={<Announcements />} />

                        <Route element={<PermissionRoute permission="manage-students" />}>
                            <Route path="/students" element={<Students />} />
                        </Route>

                        <Route element={<PermissionRoute permission="manage-teachers" />}>
                            <Route path="/teachers" element={<Teachers />} />
                        </Route>

                        <Route element={<PermissionRoute permission="manage-finance" />}>
                            <Route path="/finance" element={<Payments />} />
                        </Route>

                        <Route element={<PermissionRoute permission="manage-attendance" />}>
                            <Route path="/attendance" element={<Attendance />} />
                        </Route>

                        <Route element={<PermissionRoute permission="manage-academic" />}>
                            <Route path="/academic" element={<Academic />} />
                            <Route path="/grades" element={<Grades />} />
                        </Route>

                        <Route element={<PermissionRoute permission="manage-spp" />}>
                            <Route path="/spp" element={<SPP />} />
                        </Route>

                        <Route element={<PermissionRoute permission="manage-inventory" />}>
                            <Route path="/inventory" element={<Inventory />} />
                        </Route>

                        <Route element={<PermissionRoute permission="manage-student-points" />}>
                            <Route path="/student-points" element={<StudentPoints />} />
                        </Route>

                        <Route element={<PermissionRoute permission="manage-eoffice" />}>
                            <Route path="/eoffice" element={<EOffice />} />
                        </Route>
                        
                        {/* Wajib Superadmin */}
                        <Route element={<SuperadminRoute />}>
                            <Route path="/admin-panel" element={<AdminPanel />} />
                        </Route>

                        {/* Rute Khusus Portal Siswa (Terkait dengan sidebar Siswa di AdminLayout) */}
                        <Route path="/my-spp" element={<StudentSPP />} />
                        <Route path="/my-grades" element={<StudentGrades />} />
                        <Route path="/my-schedules" element={<StudentSchedules />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}