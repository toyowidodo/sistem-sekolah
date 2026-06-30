import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, School, Eye, EyeOff, ShieldCheck, GraduationCap, UserCog } from 'lucide-react';
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function Login() {
    const login = useAuthStore((state) => state.login);
    const { appSettings } = useSettingsStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('admin');

    const { register: registerAdmin, handleSubmit: handleSubmitAdmin, formState: { errors: errorsAdmin } } = useForm();
    const { register: registerSiswa, handleSubmit: handleSubmitSiswa, formState: { errors: errorsSiswa } } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            await login(data);
            navigate('/');
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Email atau password salah.');
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { key: 'admin', label: 'Admin / Staff', icon: UserCog },
        { key: 'siswa', label: 'Portal Siswa', icon: GraduationCap },
    ];

    const logoSrc = appSettings?.app_logo ? `${API_BASE}${appSettings.app_logo}` : null;

    const Spinner = () => (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );

    return (
        <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>

            {/* Left Decorative Panel */}
            <div
                className="hidden lg:flex flex-col justify-between w-[45%] flex-shrink-0 relative p-12 overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #0d1526 0%, #0a0f1e 100%)' }}
            >
                {/* Glows */}
                <div className="absolute top-[-15%] left-[-10%] w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', animation: 'blob 8s infinite ease-in-out' }} />
                <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', animation: 'blob 12s infinite ease-in-out reverse' }} />
                <div className="absolute top-[45%] left-[30%] w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', animation: 'blob 10s 3s infinite ease-in-out' }} />

                {/* Dot grid */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }} />

                {/* Brand */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                            {logoSrc ? (
                                <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <School size={20} className="text-white" />
                            )}
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm tracking-wide leading-none">{appSettings?.school_name || 'EduAdmin'}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.6)' }}>{appSettings?.school_subtitle || 'School System'}</p>
                        </div>
                    </div>
                </div>

                {/* Main tagline */}
                <div className="relative z-10 my-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                        <ShieldCheck size={13} style={{ color: '#a5b4fc' }} />
                        <span className="text-xs font-semibold tracking-wide" style={{ color: '#a5b4fc' }}>Platform Terpercaya</span>
                    </div>
                    <h1 className="text-4xl font-extrabold leading-tight mb-4" style={{ color: '#f1f5f9' }}>
                        Kelola Sekolah <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #818cf8, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Lebih Cerdas
                        </span>
                    </h1>
                    <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(148,163,184,0.75)' }}>
                        Sistem administrasi sekolah terpadu untuk mengelola data siswa, guru, keuangan, dan akademik dalam satu platform.
                    </p>

                    <div className="mt-8 space-y-3">
                        {[
                            { icon: '📊', text: 'Dashboard analitik real-time' },
                            { icon: '👨‍🎓', text: 'Portal siswa & laporan nilai' },
                            { icon: '💳', text: 'Pengelolaan SPP & keuangan otomatis' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    {f.icon}
                                </span>
                                <span className="text-sm" style={{ color: 'rgba(148,163,184,0.8)' }}>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-xs" style={{ color: 'rgba(100,116,139,0.55)' }}>
                        &copy; {new Date().getFullYear()} {appSettings?.school_name || 'EduAdmin'} &middot; Hak cipta dilindungi
                    </p>
                </div>
            </div>

            {/* Right Panel (Login Form) */}
            <div className="flex-1 flex items-center justify-center p-6 relative">

                {/* Mobile blobs */}
                <div className="lg:hidden blob w-72 h-72 top-[-5%] right-[-10%]"
                    style={{ background: 'rgba(99,102,241,0.3)', animationDelay: '0s' }} />
                <div className="lg:hidden blob w-60 h-60 bottom-[-5%] left-[-10%]"
                    style={{ background: 'rgba(6,182,212,0.2)', animationDelay: '4s' }} />

                {/* Card */}
                <div
                    className="relative w-full max-w-sm animate-slide-up"
                    style={{
                        background: 'var(--bg-modal)',
                        border: '1px solid var(--border-modal)',
                        boxShadow: 'var(--shadow-modal)',
                        backdropFilter: 'blur(24px)',
                        borderRadius: '24px',
                    }}
                >
                    {/* Top shimmer */}
                    <div className="absolute top-0 left-8 right-8 h-px"
                        style={{ background: activeTab === 'admin'
                            ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(6,182,212,0.7), transparent)'
                            : 'linear-gradient(90deg, transparent, rgba(6,182,212,0.7), rgba(16,185,129,0.7), transparent)'
                        }} />

                    <div className="p-8">

                        {/* Mobile brand */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                                    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                                }}>
                                {logoSrc ? (
                                    <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <School size={26} className="text-white" />
                                )}
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex rounded-xl p-1 mb-6"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => { setActiveTab(tab.key); setErrorMsg(''); setShowPassword(false); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200"
                                        style={{
                                            background: isActive
                                                ? tab.key === 'admin'
                                                    ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.15))'
                                                    : 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(16,185,129,0.15))'
                                                : 'transparent',
                                            color: isActive
                                                ? tab.key === 'admin' ? '#a5b4fc' : '#67e8f9'
                                                : 'var(--text-muted)',
                                            border: isActive
                                                ? tab.key === 'admin'
                                                    ? '1px solid rgba(99,102,241,0.3)'
                                                    : '1px solid rgba(6,182,212,0.3)'
                                                : '1px solid transparent',
                                        }}
                                    >
                                        <Icon size={14} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Heading */}
                        <div className="mb-6">
                            {activeTab === 'admin' ? (
                                <>
                                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        Selamat Datang &#x1F44B;
                                    </h2>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                        Masuk sebagai Admin atau Staff
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        Portal Siswa &#x1F393;
                                    </h2>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                        Masuk untuk melihat nilai, jadwal &amp; SPP
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Error Alert */}
                        {errorMsg && (
                            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                                style={{
                                    background: 'rgba(239,68,68,0.08)',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    color: '#f87171',
                                }}>
                                <span className="mt-0.5 flex-shrink-0">&#x26A0;&#xFE0F;</span>
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Admin Form */}
                        {activeTab === 'admin' && (
                            <form onSubmit={handleSubmitAdmin(onSubmit)} className="space-y-5" autoComplete="off">
                                <div>
                                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                                        style={{ color: 'var(--text-label)' }}>Email</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: errorsAdmin.email ? '#f87171' : 'rgba(99,102,241,0.7)' }} />
                                        <input
                                            type="email"
                                            {...registerAdmin('email', { required: 'Email wajib diisi' })}
                                            className="input-dark pl-10 w-full"
                                            placeholder="Email admin / staff"
                                            autoComplete="off"
                                            style={errorsAdmin.email ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
                                        />
                                    </div>
                                    {errorsAdmin.email && <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>{errorsAdmin.email.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                                        style={{ color: 'var(--text-label)' }}>Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: errorsAdmin.password ? '#f87171' : 'rgba(99,102,241,0.7)' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            {...registerAdmin('password', { required: 'Password wajib diisi' })}
                                            className="input-dark pl-10 pr-10 w-full"
                                            placeholder="Password Anda"
                                            autoComplete="new-password"
                                            style={errorsAdmin.password ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                                            style={{ color: 'var(--text-muted)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errorsAdmin.password && <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>{errorsAdmin.password.message}</p>}
                                </div>

                                <button type="submit" id="btn-login-admin" disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200"
                                    style={{
                                        background: isLoading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #06b6d4 100%)',
                                        boxShadow: isLoading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                                    }}
                                    onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.55)'; } }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)'; }}
                                >
                                    {isLoading ? <><Spinner /> Memverifikasi...</> : <><LogIn size={16} /> Masuk ke Dashboard</>}
                                </button>
                            </form>
                        )}

                        {/* Siswa Form */}
                        {activeTab === 'siswa' && (
                            <form onSubmit={handleSubmitSiswa(onSubmit)} className="space-y-5" autoComplete="off">
                                {/* Info banner */}
                                <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs"
                                    style={{
                                        background: 'rgba(6,182,212,0.08)',
                                        border: '1px solid rgba(6,182,212,0.2)',
                                        color: '#67e8f9',
                                    }}>
                                    <GraduationCap size={15} className="flex-shrink-0 mt-0.5" />
                                    <span>Gunakan email dan password yang diberikan oleh pihak sekolah untuk masuk ke portal siswa.</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                                        style={{ color: 'var(--text-label)' }}>Email Siswa</label>
                                    <div className="relative">
                                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: errorsSiswa.email ? '#f87171' : 'rgba(6,182,212,0.7)' }} />
                                        <input
                                            type="email"
                                            {...registerSiswa('email', { required: 'Email wajib diisi' })}
                                            className="input-dark pl-10 w-full"
                                            placeholder="email.siswa@sekolah.id"
                                            autoComplete="off"
                                            style={errorsSiswa.email ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
                                        />
                                    </div>
                                    {errorsSiswa.email && <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>{errorsSiswa.email.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                                        style={{ color: 'var(--text-label)' }}>Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ color: errorsSiswa.password ? '#f87171' : 'rgba(6,182,212,0.7)' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            {...registerSiswa('password', { required: 'Password wajib diisi' })}
                                            className="input-dark pl-10 pr-10 w-full"
                                            placeholder="Password siswa"
                                            autoComplete="new-password"
                                            style={errorsSiswa.password ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                                            style={{ color: 'var(--text-muted)' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#67e8f9'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {errorsSiswa.password && <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>{errorsSiswa.password.message}</p>}
                                </div>

                                <button type="submit" id="btn-login-siswa" disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200"
                                    style={{
                                        background: isLoading ? 'rgba(6,182,212,0.4)' : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #10b981 100%)',
                                        boxShadow: isLoading ? 'none' : '0 4px 20px rgba(6,182,212,0.4)',
                                    }}
                                    onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(6,182,212,0.55)'; } }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(6,182,212,0.4)'; }}
                                >
                                    {isLoading ? <><Spinner /> Memverifikasi...</> : <><GraduationCap size={16} /> Masuk ke Portal Siswa</>}
                                </button>
                            </form>
                        )}

                        {/* Footer */}
                        <div className="mt-7 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                            <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                                &copy; {new Date().getFullYear()} {appSettings?.school_name || 'EduAdmin'} &nbsp;&middot;&nbsp; Seluruh hak dilindungi
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
