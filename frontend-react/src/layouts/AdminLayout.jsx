import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Wallet, LogOut, School, ChevronRight, Moon, Sun, ClipboardList, Megaphone, BookOpen, Shield, Award, CreditCard, CalendarDays, PackageSearch, Mail, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';

export default function AdminLayout() {
    const { user, fetchUser, logout, isAuthenticated } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const { appSettings } = useSettingsStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    useEffect(() => {
        if (isAuthenticated && !user) fetchUser();
    }, [isAuthenticated, user, fetchUser]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const adminItems = [
        { name: 'Dashboard',    path: '/',              icon: LayoutDashboard, exact: true },
        { name: 'Data Siswa',   path: '/students',      icon: Users, requiredPermission: 'manage-students' },
        { name: 'Data Guru',    path: '/teachers',      icon: GraduationCap, requiredPermission: 'manage-teachers' },
        { name: 'Keuangan',     path: '/finance',       icon: Wallet, requiredPermission: 'manage-finance' },
        { name: 'SPP',          path: '/spp',           icon: CreditCard, requiredPermission: 'manage-spp' },
        { name: 'Absensi',      path: '/attendance',    icon: ClipboardList, requiredPermission: 'manage-attendance' },
        { name: 'Kedisiplinan', path: '/student-points', icon: Award, requiredPermission: 'manage-student-points' },
        { name: 'Akademik',     path: '/academic',      icon: BookOpen, requiredPermission: 'manage-academic' },
        { name: 'Nilai & Rapor',path: '/grades',        icon: Award, requiredPermission: 'manage-academic' },
        { name: 'Pengumuman',   path: '/announcements', icon: Megaphone },
        { name: 'Kalender',     path: '/calendar',      icon: CalendarDays },
        { name: 'Inventaris',   path: '/inventory',     icon: PackageSearch, requiredPermission: 'manage-inventory' },
        { name: 'Tata Persuratan', path: '/eoffice',    icon: Mail, requiredPermission: 'manage-eoffice' },
    ];

    const studentItems = [
        { name: 'Dashboard Siswa', path: '/',              icon: LayoutDashboard, exact: true },
        { name: 'Rapor & Nilai',   path: '/my-grades',     icon: Award },
        { name: 'Tagihan SPP',     path: '/my-spp',        icon: CreditCard },
        { name: 'Jadwal Kelas',    path: '/my-schedules',  icon: CalendarDays },
    ];

    const superadminItems = [
        { name: 'Panel Admin',  path: '/admin-panel',   icon: Shield },
    ];

    const isSiswa = user?.roles?.includes('Siswa');
    const isSuperadmin = user?.roles?.includes('Superadmin');
    const userPermissions = user?.permissions || [];

    const menuItems = isSiswa 
        ? studentItems 
        : adminItems.filter(item => 
            isSuperadmin || !item.requiredPermission || userPermissions.includes(item.requiredPermission)
        );

    const isActive = (item) =>
        item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

    // Menutup sidebar ketika route berubah (di mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const greeting = () => {
        const h = currentTime.getHours();
        if (h < 11) return 'Selamat pagi';
        if (h < 15) return 'Selamat siang';
        if (h < 18) return 'Selamat sore';
        return 'Selamat malam';
    };

    const isDark = theme === 'dark';

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
                    onClick={() => setIsSidebarOpen(false)} 
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col flex-shrink-0 overflow-hidden transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{
                    background: 'var(--bg-sidebar)',
                    borderRight: '1px solid var(--border)',
                }}
            >
                {/* Subtle sidebar top glow */}
                <div className="absolute top-0 left-0 w-full h-40 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 30% 0%, var(--sidebar-glow) 0%, transparent 70%)` }} />

                {/* Logo */}
                <div className="h-16 flex items-center gap-3 px-6 relative"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)' }}>
                        {appSettings?.app_logo ? (
                            <img src={`${import.meta.env.VITE_API_BASE_URL || ''}${appSettings.app_logo}`} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <School size={16} className="text-white" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-sm tracking-wide leading-none" style={{ color: 'var(--text-primary)' }}>
                            {appSettings?.school_name || 'EduAdmin'}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{appSettings?.school_subtitle || 'School System'}</p>
                    </div>
                    {/* Close button for mobile */}
                    <button 
                        className="md:hidden absolute right-4 p-1 rounded-lg"
                        style={{ color: 'var(--text-muted)' }}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 space-y-1 relative z-10 overflow-y-auto">
                    {menuItems.map((item, index) => {
                        const active = isActive(item);
                        return (
                            <Link key={index} to={item.path} className={`sidebar-item ${active ? 'active' : ''}`}>
                                <item.icon size={18} />
                                <span className="flex-1">{item.name}</span>
                                {active && <ChevronRight size={14} className="opacity-60" />}
                            </Link>
                        );
                    })}

                    {/* Superadmin divider */}
                    {user?.roles?.includes('Superadmin') && (
                        <>
                            <div className="mx-4 my-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-px" style={{ background: 'rgba(239,68,68,0.25)' }} />
                                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(239,68,68,0.5)', fontSize: '9px' }}>Superadmin</span>
                                    <div className="flex-1 h-px" style={{ background: 'rgba(239,68,68,0.25)' }} />
                                </div>
                            </div>

                            {superadminItems.map((item, index) => {
                                const active = isActive(item);
                                return (
                                    <Link key={index} to={item.path}
                                        className={`sidebar-item ${active ? 'active' : ''}`}
                                        style={active ? {} : { color: 'rgba(239,68,68,0.7)' }}
                                        onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#f87171'; }}
                                        onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(239,68,68,0.7)'; }}
                                    >
                                        <item.icon size={18} />
                                        <span className="flex-1">{item.name}</span>
                                        {active && <ChevronRight size={14} className="opacity-60" />}
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>

                {/* Bottom user panel */}
                <div className="p-4 relative z-10" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
                        style={{ background: 'var(--bg-user-panel)', border: '1px solid var(--border)' }}
                        onClick={() => navigate('/profile')}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'var(--bg-table-hover)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-user-panel)'; }}
                        title="Lihat Profil Saya"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                {user?.name || '...'}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                {user?.roles?.[0] || 'Pengguna'}
                            </p>
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); handleLogout(); }}
                            title="Logout"
                            className="flex-shrink-0 p-1.5 rounded-lg transition-all duration-200"
                            style={{ color: 'rgba(239,68,68,0.7)' }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                                e.currentTarget.style.color = '#f87171';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(239,68,68,0.7)';
                            }}
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>


            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Topbar */}
                <header
                    className="h-16 flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
                    style={{
                        background: 'var(--bg-topbar)',
                        borderBottom: '1px solid var(--border)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="md:hidden p-2 -ml-2 rounded-xl transition-colors"
                            style={{ color: 'var(--text-primary)', background: 'var(--bg-input)' }}
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                {greeting()},
                            </p>
                            <h2 className="text-sm font-semibold truncate max-w-[150px] sm:max-w-none" style={{ color: 'var(--text-primary)' }}>
                                {user?.name || 'Administrator'} 👋
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Clock */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                            style={{
                                background: 'var(--clock-bg)',
                                border: '1px solid var(--clock-border)',
                                color: 'var(--clock-text)',
                            }}>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10b981' }} />
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* ── Theme Toggle ── */}
                        <button
                            onClick={toggleTheme}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            className="relative w-[52px] h-7 rounded-full flex-shrink-0 transition-all duration-300 cursor-pointer"
                            style={{
                                background: 'var(--toggle-track)',
                                border: '1px solid var(--toggle-border)',
                            }}
                            id="theme-toggle-btn"
                        >
                            {/* Track icons */}
                            <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
                                <Moon size={11} style={{ color: isDark ? 'var(--toggle-icon-color)' : 'var(--text-muted)' }} />
                                <Sun  size={11} style={{ color: isDark ? 'var(--text-muted)' : 'var(--toggle-icon-color)' }} />
                            </span>
                            {/* Thumb */}
                            <span
                                className="absolute top-[3px] w-[22px] h-[22px] rounded-full transition-all duration-300 flex items-center justify-center"
                                style={{
                                    left: isDark ? '3px' : 'calc(100% - 25px)',
                                    background: isDark
                                        ? 'linear-gradient(135deg, #6366f1, #06b6d4)'
                                        : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                                    boxShadow: isDark
                                        ? '0 2px 8px rgba(99,102,241,0.5)'
                                        : '0 2px 8px rgba(245,158,11,0.5)',
                                }}
                            >
                                {isDark
                                    ? <Moon size={10} className="text-white" />
                                    : <Sun  size={10} className="text-white" />
                                }
                            </span>
                        </button>

                        {/* Avatar — klik untuk ke profil */}
                        <button
                            onClick={() => navigate('/profile')}
                            title={`Profil: ${user?.name || 'Pengguna'}`}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all duration-200 flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main
                    className="flex-1 overflow-y-auto"
                    style={{ background: 'var(--bg-base)' }}
                >
                    <div className="animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}