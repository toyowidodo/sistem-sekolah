import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Shield, Edit3, Save, X, CheckCircle, Eye, EyeOff, Key } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import Swal from 'sweetalert2';

const swal = (opts) => Swal.fire({ background: '#0d1526', color: '#e2e8f0', ...opts });

const ROLE_CFG = {
    'Superadmin':    { color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   label: 'Superadmin' },
    'Admin Sekolah': { color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)',  label: 'Admin Sekolah' },
    'Guru':          { color: '#34d399', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  label: 'Guru' },
    'Tata Usaha':    { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  label: 'Tata Usaha' },
    'Bendahara':     { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  label: 'Bendahara' },
    'Siswa':         { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.3)',  label: 'Siswa' },
    'Orang Tua':     { color: '#67e8f9', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)',   label: 'Orang Tua' },
};

const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-1.5';
const labelStyle = { color: 'var(--text-label)' };

function PasswordInput({ register, name, placeholder, errors }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                {...register}
                placeholder={placeholder}
                className="input-dark pr-10 w-full"
            />
            <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {errors && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.message}</p>}
        </div>
    );
}

export default function Profile() {
    const { user, fetchUser } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPwd, setSavingPwd] = useState(false);
    const [pwdSuccess, setPwdSuccess] = useState(false);

    const profileForm = useForm();
    const pwdForm = useForm();

    /* ── Load profile ── */
    useEffect(() => {
        api.get('/profile')
            .then(r => {
                setProfile(r.data);
                profileForm.reset({ name: r.data.name, email: r.data.email });
            })
            .catch(() => swal({ title: 'Error', text: 'Gagal memuat profil', icon: 'error' }));
    }, []);

    /* ── Update profile ── */
    const onSaveProfile = async (data) => {
        setSavingProfile(true);
        try {
            const res = await api.put('/profile', data);
            setProfile(res.data.user);
            await fetchUser(); // sync global auth store
            setEditMode(false);
            swal({ title: 'Tersimpan!', text: 'Profil berhasil diperbarui.', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal menyimpan', icon: 'error' });
        } finally { setSavingProfile(false); }
    };

    /* ── Change password ── */
    const onChangePwd = async (data) => {
        setSavingPwd(true);
        setPwdSuccess(false);
        try {
            await api.put('/profile/password', {
                current_password: data.current_password,
                new_password: data.new_password,
                new_password_confirmation: data.confirm_password,
            });
            setPwdSuccess(true);
            pwdForm.reset();
            setTimeout(() => setPwdSuccess(false), 4000);
        } catch (e) {
            swal({ title: 'Gagal', text: e.response?.data?.message || 'Terjadi kesalahan', icon: 'error' });
        } finally { setSavingPwd(false); }
    };

    if (!profile) return (
        <div className="p-10 flex flex-col items-center justify-center gap-4">
            <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="4" />
                <path className="opacity-75" fill="#6366f1" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat profil...</p>
        </div>
    );

    const role = profile.roles?.[0];
    const rcfg = ROLE_CFG[role] || ROLE_CFG['Admin Sekolah'];
    const initials = profile.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const joinedAt = profile.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">

            {/* ── Page Header ── */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                    <User size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Profil Saya</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Kelola informasi akun dan keamanan Anda</p>
                </div>
            </div>

            {/* ── Avatar + Identity Card ── */}
            <div className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>

                {/* Decorative bg blob */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

                <div className="flex items-center gap-5 flex-wrap relative z-10">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
                            style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                            {initials}
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: rcfg.bg, border: `2px solid ${rcfg.border}` }}>
                            <Shield size={9} style={{ color: rcfg.color }} />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{profile.name}</h2>
                        <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            <Mail size={12} /> {profile.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {/* Role badge */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ background: rcfg.bg, color: rcfg.color, border: `1px solid ${rcfg.border}` }}>
                                <Shield size={10} /> {role || 'Pengguna'}
                            </span>
                            {/* Join date */}
                            <span className="text-xs px-2.5 py-1 rounded-full"
                                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-input)' }}>
                                Bergabung {joinedAt}
                            </span>
                        </div>
                    </div>

                    {/* Edit toggle */}
                    <button onClick={() => { setEditMode(e => !e); profileForm.reset({ name: profile.name, email: profile.email }); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${editMode ? 'btn-ghost' : 'btn-primary'}`}>
                        {editMode ? <><X size={13} /> Batal</> : <><Edit3 size={13} /> Edit Profil</>}
                    </button>
                </div>
            </div>

            {/* ── Edit Profile Form ── */}
            <div className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${editMode ? 'rgba(99,102,241,0.4)' : 'var(--border-card)'}`,
                    boxShadow: 'var(--shadow-card)',
                }}>
                <div className="px-5 py-4 flex items-center gap-2"
                    style={{ borderBottom: '1px solid var(--border)', background: editMode ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
                    <User size={14} style={{ color: editMode ? '#818cf8' : 'var(--text-muted)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Informasi Akun</p>
                    {editMode && (
                        <span className="text-xs px-2 py-0.5 rounded-full ml-auto font-semibold"
                            style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
                            Mode Edit
                        </span>
                    )}
                </div>

                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Nama Lengkap</label>
                            {editMode ? (
                                <>
                                    <input {...profileForm.register('name', { required: 'Nama wajib diisi' })}
                                        className="input-dark w-full" placeholder="Nama lengkap" />
                                    {profileForm.formState.errors.name && (
                                        <p className="text-xs mt-1" style={{ color: '#f87171' }}>{profileForm.formState.errors.name.message}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm font-medium py-2 px-3 rounded-lg"
                                    style={{ color: 'var(--text-primary)', background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                                    {profile.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Email</label>
                            {editMode ? (
                                <>
                                    <input type="email" {...profileForm.register('email', { required: 'Email wajib diisi' })}
                                        className="input-dark w-full" placeholder="email@sekolah.id" />
                                    {profileForm.formState.errors.email && (
                                        <p className="text-xs mt-1" style={{ color: '#f87171' }}>{profileForm.formState.errors.email.message}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm font-medium py-2 px-3 rounded-lg flex items-center gap-1.5"
                                    style={{ color: 'var(--text-primary)', background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                                    <Mail size={12} style={{ color: 'var(--text-muted)' }} /> {profile.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass} style={labelStyle}>Role / Jabatan</label>
                        <div className="py-2 px-3 rounded-lg flex items-center gap-2"
                            style={{ background: rcfg.bg, border: `1px solid ${rcfg.border}` }}>
                            <Shield size={13} style={{ color: rcfg.color }} />
                            <p className="text-sm font-semibold" style={{ color: rcfg.color }}>{role || 'Pengguna'}</p>
                            <span className="text-xs ml-1" style={{ color: rcfg.color, opacity: 0.7 }}>· Tidak dapat diubah sendiri</span>
                        </div>
                    </div>

                    {editMode && (
                        <div className="flex justify-end pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                            <button type="submit" disabled={savingProfile} className="btn-primary text-sm"
                                style={{ opacity: savingProfile ? 0.6 : 1 }}>
                                {savingProfile
                                    ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Menyimpan...</>
                                    : <><Save size={13} /> Simpan Perubahan</>}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* ── Change Password ── */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <Key size={14} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Keamanan — Ubah Password</p>
                </div>

                <form onSubmit={pwdForm.handleSubmit(onChangePwd)} className="p-5 space-y-4">
                    {/* Success banner */}
                    {pwdSuccess && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>
                            <CheckCircle size={15} /> Password berhasil diubah!
                        </div>
                    )}

                    <div>
                        <label className={labelClass} style={labelStyle}>Password Saat Ini</label>
                        <PasswordInput
                            register={pwdForm.register('current_password', { required: 'Wajib diisi' })}
                            placeholder="Masukkan password saat ini"
                            errors={pwdForm.formState.errors.current_password}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Password Baru</label>
                            <PasswordInput
                                register={pwdForm.register('new_password', {
                                    required: 'Wajib diisi',
                                    minLength: { value: 6, message: 'Minimal 6 karakter' }
                                })}
                                placeholder="Min. 6 karakter"
                                errors={pwdForm.formState.errors.new_password}
                            />
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Konfirmasi Password Baru</label>
                            <PasswordInput
                                register={pwdForm.register('confirm_password', {
                                    required: 'Wajib diisi',
                                    validate: v => v === pwdForm.watch('new_password') || 'Password tidak cocok'
                                })}
                                placeholder="Ulangi password baru"
                                errors={pwdForm.formState.errors.confirm_password}
                            />
                        </div>
                    </div>

                    {/* Password requirements */}
                    <div className="flex flex-wrap gap-2">
                        {['Min. 6 karakter', 'Huruf & angka', 'Berbeda dari sebelumnya'].map((tip, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-lg"
                                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-input)' }}>
                                ✓ {tip}
                            </span>
                        ))}
                    </div>

                    <div className="flex justify-end pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="submit" disabled={savingPwd} className="btn-primary text-sm"
                            style={{ background: 'linear-gradient(135deg,#ef4444,#f87171)', opacity: savingPwd ? 0.6 : 1 }}>
                            {savingPwd
                                ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Menyimpan...</>
                                : <><Lock size={13} /> Ubah Password</>}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
}
