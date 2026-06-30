import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, School } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
    const login = useAuthStore((state) => state.login);
    const { appSettings } = useSettingsStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const { register, handleSubmit } = useForm();

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

    return (
        <div
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: 'var(--bg-base)' }}
        >
            {/* Animated Background Blobs */}
            <div className="blob w-96 h-96 top-[-10%] left-[-5%]"
                style={{ background: 'rgba(99,102,241,0.35)', animationDelay: '0s' }} />
            <div className="blob w-80 h-80 bottom-[-5%] right-[-5%]"
                style={{ background: 'rgba(6,182,212,0.3)', animationDelay: '3s' }} />
            <div className="blob w-64 h-64 top-[40%] right-[20%]"
                style={{ background: 'rgba(139,92,246,0.2)', animationDelay: '5s' }} />

            {/* Grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(var(--border) 1px, transparent 1px),
                        linear-gradient(90deg, var(--border) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* Login Card */}
            <div
                className="relative w-full max-w-[90%] sm:max-w-md mx-4 rounded-3xl animate-slide-up"
                style={{
                    background: 'var(--bg-modal)',
                    border: '1px solid var(--border-modal)',
                    boxShadow: 'var(--shadow-modal)',
                    backdropFilter: 'blur(24px)',
                }}
            >
                {/* Top gradient border */}
                <div
                    className="absolute top-0 left-6 right-6 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(6,182,212,0.6), transparent)' }}
                />

                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        {/* Logo Container */}
                        <div
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                                boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
                            }}
                        >
                            {appSettings?.app_logo ? (
                                <img 
                                    src={`https://api.niswa.online${appSettings.app_logo}`}
                                    alt="Logo Sekolah" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <School size={32} className="text-white" />
                            )}
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{appSettings?.school_name || 'EduAdmin'}</h1>
                        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            {appSettings?.school_subtitle || 'Sistem Administrasi Sekolah'}
                        </p>
                    </div>

                    {/* Error Alert */}
                    {errorMsg && (
                        <div
                            className="mb-4 px-4 py-3 rounded-xl text-sm"
                            style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                color: '#f87171',
                            }}
                        >
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                                style={{ color: 'var(--text-label)' }}>
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ color: 'rgba(99,102,241,0.7)' }}
                                />
                                <input
                                    type="email"
                                    {...register('email', { required: true })}
                                    className="input-dark pl-10"
                                    placeholder="admin@sekolah.id"
                                    defaultValue="admin@sekolah.id"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                                style={{ color: 'var(--text-label)' }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ color: 'rgba(99,102,241,0.7)' }}
                                />
                                <input
                                    type="password"
                                    {...register('password', { required: true })}
                                    className="input-dark pl-10"
                                    placeholder="••••••••"
                                    defaultValue="password123"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            id="btn-login"
                            disabled={isLoading}
                            className="btn-primary w-full justify-center py-3 mt-2 rounded-xl"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                            stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Masuk...
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
                        © 2027 EduAdmin · Sistem Administrasi Sekolah
                    </p>
                </div>
            </div>
        </div>
    );
}