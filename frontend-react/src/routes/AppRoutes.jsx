import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import PermissionRoute from './PermissionRoute';
import StudentDashboard from '../pages/StudentPortal/StudentDashboard';
import StudentSPP from '../pages/StudentPortal/StudentSPP';
import StudentGrades from '../pages/StudentPortal/StudentGrades';
import StudentSchedules from '../pages/StudentPortal/StudentSchedules';
import TeacherDashboard from '../pages/TeacherPortal/TeacherDashboard';
import TeacherSchedules from '../pages/TeacherPortal/TeacherSchedules';
import HomeroomClass from '../pages/TeacherPortal/HomeroomClass';
import ParentDashboard from '../pages/ParentPortal/ParentDashboard';
import ParentGrades from '../pages/ParentPortal/ParentGrades';
import ParentSPP from '../pages/ParentPortal/ParentSPP';
import ParentAttendance from '../pages/ParentPortal/ParentAttendance';
import { useAuthStore } from '../store/authStore';
import AccessLoading from './AccessLoading';
import { isGuru, isOrangTua } from '../utils/roles';

/** Guard: hanya role Siswa yang bisa mengakses halaman portal siswa */
function SiswaRoute({ children }) {
    const user = useAuthStore(state => state.user);
    const userLoaded = useAuthStore(state => state.userLoaded);

    // Tunggu data user termuat, kalau tidak siswa akan ditendang ke dashboard
    // setiap kali me-refresh halaman portal
    if (!userLoaded) return <AccessLoading />;

    const isSiswa = user?.roles?.includes('Siswa');
    if (!isSiswa) return <Navigate to="/" replace />;
    return children;
}

/** Guard: hanya guru (role Guru, bukan admin sekolah) yang boleh masuk portal guru */
function GuruRoute({ children }) {
    const user = useAuthStore(state => state.user);
    const userLoaded = useAuthStore(state => state.userLoaded);

    if (!userLoaded) return <AccessLoading />;

    if (!isGuru(user)) return <Navigate to="/" replace />;
    return children;
}

/** Guard: hanya orang tua / wali yang boleh masuk portal orang tua */
function OrangTuaRoute({ children }) {
    const user = useAuthStore(state => state.user);
    const userLoaded = useAuthStore(state => state.userLoaded);

    if (!userLoaded) return <AccessLoading />;

    if (!isOrangTua(user)) return <Navigate to="/" replace />;
    return children;
}

/** Dashboard berbeda per role, jadi harus menunggu role diketahui dulu */
function DashboardSwitch() {
    const user = useAuthStore(state => state.user);
    const userLoaded = useAuthStore(state => state.userLoaded);

    if (!userLoaded) return <AccessLoading />;

    if (user?.roles?.includes('Siswa')) return <StudentDashboard />;
    if (isOrangTua(user)) return <ParentDashboard />;
    if (isGuru(user)) return <TeacherDashboard />;
    return <Dashboard />;
}

export default function AppRoutes() {

    return (
        <BrowserRouter>
            <Routes>
                {/* Halaman Login (Bebas Akses) */}
                <Route path="/login" element={<Login />} />

                {/* Halaman yang Diproteksi (Wajib Login) */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                        {/* Dashboard: siswa → StudentDashboard, lainnya → Dashboard biasa */}
                        <Route path="/" element={<DashboardSwitch />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/calendar" element={<AcademicCalendar />} />
                        <Route path="/announcements" element={<Announcements />} />

                        {/* Rute berdasarkan Permission */}
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
                        </Route>

                        <Route element={<PermissionRoute permission="manage-grades" />}>
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

                        {/* Portal Guru — hanya guru yang bisa akses */}
                        <Route path="/my-teaching" element={<GuruRoute><TeacherSchedules /></GuruRoute>} />
                        <Route path="/my-homeroom" element={<GuruRoute><HomeroomClass /></GuruRoute>} />

                        {/* Portal Orang Tua */}
                        <Route path="/anak/nilai"    element={<OrangTuaRoute><ParentGrades /></OrangTuaRoute>} />
                        <Route path="/anak/spp"      element={<OrangTuaRoute><ParentSPP /></OrangTuaRoute>} />
                        <Route path="/anak/absensi"  element={<OrangTuaRoute><ParentAttendance /></OrangTuaRoute>} />

                        {/* Portal Siswa — hanya role Siswa yang bisa akses */}
                        <Route path="/my-spp" element={<SiswaRoute><StudentSPP /></SiswaRoute>} />
                        <Route path="/my-grades" element={<SiswaRoute><StudentGrades /></SiswaRoute>} />
                        <Route path="/my-schedules" element={<SiswaRoute><StudentSchedules /></SiswaRoute>} />
                    </Route>
                </Route>

                {/* Fallback — redirect ke home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}