import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ModernSelect from '../components/ModernSelect';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { UserPlus, Trash2, Mail, Phone } from 'lucide-react';

const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-1.5';
const labelStyle = { color: 'var(--text-label)' };
const swal = (opts) => swal({ ...opts });

const RELATION_LABEL = { ayah: 'Ayah', ibu: 'Ibu', wali: 'Wali' };

/** Mengelola akun orang tua / wali yang bisa memantau seorang siswa */
export default function GuardianModal({ student, isOpen, onClose }) {
    const [guardians, setGuardians] = useState([]);
    const [suggested, setSuggested] = useState([]);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const load = useCallback(async () => {
        if (!student) return;
        setLoading(true);
        try {
            const res = await api.get(`/students/${student.id}/guardians`);
            setGuardians(res.data.data || []);
            setSuggested(res.data.suggested || []);
        } catch {
            swal({ title: 'Error', text: 'Gagal memuat akun orang tua', icon: 'error' });
        } finally {
            setLoading(false);
        }
    }, [student]);

    useEffect(() => {
        if (isOpen) {
            reset({ name: '', email: '', relation: 'ayah', phone: '' });
            load();
        }
    }, [isOpen, load, reset]);

    const onSubmit = async (data) => {
        try {
            const res = await api.post(`/students/${student.id}/guardians`, data);
            const account = res.data.account;

            if (account) {
                swal({
                    title: 'Akun Orang Tua Dibuat',
                    html: `<p style="margin-bottom:12px">Serahkan kredensial berikut. Password ini <b>tidak bisa dilihat lagi</b> setelah dialog ditutup.</p>
                           <div style="text-align:left;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.25);border-radius:12px;padding:12px">
                             <div style="font-size:12px;opacity:.7">Email</div>
                             <div style="font-weight:700;margin-bottom:8px">${account.email}</div>
                             <div style="font-size:12px;opacity:.7">Password</div>
                             <div style="font-weight:700;font-family:monospace;font-size:18px">${account.password}</div>
                           </div>`,
                    icon: 'success', confirmButtonText: 'Sudah saya catat'
                });
            } else {
                swal({ title: 'Terhubung', text: res.data.message, icon: 'success', timer: 2000, showConfirmButton: false });
            }

            reset({ name: '', email: '', relation: 'ayah', phone: '' });
            load();
        } catch (err) {
            const v = err.response?.data?.errors;
            swal({
                title: 'Gagal',
                text: v ? Object.values(v).flat().join('\n') : err.response?.data?.message || 'Terjadi kesalahan',
                icon: 'error'
            });
        }
    };

    const handleUnlink = (g) => swal({
        title: `Putuskan akses ${g.name}?`,
        text: 'Akun ini tidak akan bisa lagi melihat data siswa tersebut.',
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Putuskan', cancelButtonText: 'Batal'
    }).then(async r => {
        if (!r.isConfirmed) return;
        try {
            const res = await api.delete(`/students/${student.id}/guardians/${g.user_id}`);
            swal({ title: 'Diputus', text: res.data.message, icon: 'success', timer: 2200, showConfirmButton: false });
            load();
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal', icon: 'error' });
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Akun Orang Tua — ${student?.name || ''}`}>
            <div className="space-y-5">
                {/* Daftar akun terhubung */}
                <div>
                    <h3 className="text-sm font-bold border-b border-[var(--border)] pb-2 mb-3 text-indigo-400">
                        Akun Terhubung
                    </h3>
                    {loading ? (
                        <p className="text-sm text-gray-500">Memuat...</p>
                    ) : guardians.length === 0 ? (
                        <p className="text-sm text-gray-500">Belum ada akun orang tua untuk siswa ini.</p>
                    ) : (
                        <div className="space-y-2">
                            {guardians.map(g => (
                                <div key={g.user_id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{g.name}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                                                {RELATION_LABEL[g.relation] || g.relation}
                                            </span>
                                            {!g.is_active && (
                                                <span className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Nonaktif</span>
                                            )}
                                        </div>
                                        <p className="text-xs mt-0.5 flex items-center gap-2 truncate" style={{ color: 'var(--text-muted)' }}>
                                            <Mail size={10} /> {g.email}
                                            {g.phone && <><Phone size={10} /> {g.phone}</>}
                                        </p>
                                    </div>
                                    <button onClick={() => handleUnlink(g)} title="Putuskan akses"
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Form tambah */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <h3 className="text-sm font-bold border-b border-[var(--border)] pb-2 text-indigo-400">
                        Tambah Akun
                    </h3>

                    {suggested.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Isi cepat dari data siswa:</span>
                            {suggested.map((s, i) => (
                                <button key={i} type="button"
                                    onClick={() => { setValue('name', s.name); setValue('relation', s.relation); }}
                                    className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                                    {RELATION_LABEL[s.relation]}: {s.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Nama</label>
                            <input {...register('name', { required: true })} className="input-dark w-full" placeholder="Nama orang tua" />
                            {errors.name && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Hubungan</label>
                            <ModernSelect {...register('relation', { required: true })} className="input-dark w-full">
                                <option value="ayah">Ayah</option>
                                <option value="ibu">Ibu</option>
                                <option value="wali">Wali</option>
                            </ModernSelect>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Email</label>
                            <input type="email" {...register('email', { required: true })} className="input-dark w-full" placeholder="ortu@email.com" />
                            {errors.email && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Email valid wajib diisi</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>No. HP (opsional)</label>
                            <input {...register('phone')} className="input-dark w-full" placeholder="08xx-xxxx-xxxx" />
                        </div>
                    </div>

                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Kalau emailnya sudah terdaftar, akun itu akan dipakai ulang dan hanya ditautkan ke anak ini —
                        berguna untuk orang tua yang punya beberapa anak di sekolah yang sama.
                    </p>

                    <div className="flex justify-end gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={onClose} className="btn-ghost">Tutup</button>
                        <button type="submit" className="btn-primary"><UserPlus size={13} /> Buat & Hubungkan</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
