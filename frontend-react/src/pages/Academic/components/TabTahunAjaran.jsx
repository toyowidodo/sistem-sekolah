import { useCallback, useEffect, useState } from 'react';
import api from '../../../api/axios';
import Modal from '../../../components/Modal';
import ModernSelect from '../../../components/ModernSelect';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { CalendarRange, PlusCircle, Edit, Trash2, CheckCircle, Users } from 'lucide-react';

const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-1.5';
const labelStyle = { color: 'var(--text-label)' };
const swal = (opts) => Swal.fire({ background: 'var(--bg-modal)', color: 'var(--text-primary)', ...opts });

export default function TabTahunAjaran() {
    const [years, setYears] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchYears = useCallback(async () => {
        try {
            const res = await api.get('/academic-years');
            setYears(res.data.data || []);
        } catch {
            swal({ title: 'Error', text: 'Gagal memuat tahun ajaran', icon: 'error' });
        }
    }, []);

    useEffect(() => { fetchYears(); }, [fetchYears]);

    const openCreate = () => {
        reset({ name: '', semester: 'Ganjil', start_date: '', end_date: '' });
        setEditId(null);
        setIsOpen(true);
    };

    const openEdit = (y) => {
        reset({ name: y.name, semester: y.semester, start_date: y.start_date || '', end_date: y.end_date || '' });
        setEditId(y.id);
        setIsOpen(true);
    };

    const onSubmit = async (data) => {
        const payload = { ...data, start_date: data.start_date || null, end_date: data.end_date || null };
        try {
            if (editId) await api.put(`/academic-years/${editId}`, payload);
            else await api.post('/academic-years', payload);

            swal({ title: 'Sukses!', icon: 'success', timer: 1400, showConfirmButton: false });
            setIsOpen(false);
            fetchYears();
        } catch (err) {
            const v = err.response?.data?.errors;
            swal({
                title: 'Gagal Menyimpan',
                text: v ? Object.values(v).flat().join('\n') : err.response?.data?.message || 'Terjadi kesalahan',
                icon: 'error',
            });
        }
    };

    const handleActivate = (y) => swal({
        title: `Aktifkan ${y.name}?`,
        text: 'Tahun ajaran ini akan dipakai sebagai default di modul nilai, SPP, dan rapor.',
        icon: 'question', showCancelButton: true,
        confirmButtonColor: '#047857',
        confirmButtonText: 'Ya, Aktifkan', cancelButtonText: 'Batal',
    }).then(async r => {
        if (!r.isConfirmed) return;
        try {
            const res = await api.post(`/academic-years/${y.id}/activate`);
            swal({ title: 'Sukses', text: res.data.message, icon: 'success', timer: 1800, showConfirmButton: false });
            fetchYears();
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal', icon: 'error' });
        }
    });

    const handleDelete = (y) => swal({
        title: `Hapus tahun ajaran ${y.name}?`,
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal',
    }).then(async r => {
        if (!r.isConfirmed) return;
        try {
            await api.delete(`/academic-years/${y.id}`);
            swal({ title: 'Terhapus', icon: 'success', timer: 1200, showConfirmButton: false });
            fetchYears();
        } catch (e) {
            swal({ title: 'Tidak Bisa Dihapus', text: e.response?.data?.message || 'Gagal', icon: 'error' });
        }
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Tahun ajaran aktif menjadi default modul nilai, SPP, dan rapor.
                </p>
                <button onClick={openCreate} className="btn-primary"><PlusCircle size={13} /> Tambah Tahun Ajaran</button>
            </div>

            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                                {['Tahun Ajaran', 'Semester', 'Periode', 'Siswa Tercatat', 'Status', 'Aksi'].map((h, i) => (
                                    <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--text-th)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {years.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                    Belum ada tahun ajaran
                                </td></tr>
                            ) : years.map((y, i) => (
                                <tr key={y.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}>
                                    <td className="py-3 px-4">
                                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{y.name}</span>
                                    </td>
                                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{y.semester}</td>
                                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {y.start_date ? `${y.start_date} s/d ${y.end_date || '...'}` : '-'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            <Users size={12} /> {y.students}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {y.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                <CheckCircle size={10} /> Aktif
                                            </span>
                                        ) : (
                                            <button onClick={() => handleActivate(y)}
                                                className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                                                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-input)' }}>
                                                Jadikan Aktif
                                            </button>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => openEdit(y)} title="Edit"
                                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                                                <Edit size={12} />
                                            </button>
                                            <button onClick={() => handleDelete(y)} title="Hapus" disabled={y.is_active}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Tahun Ajaran</label>
                            <input {...register('name', { required: true })} className="input-dark w-full" placeholder="2025/2026" />
                            {errors.name && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Semester</label>
                            <ModernSelect {...register('semester', { required: true })} className="input-dark w-full">
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                            </ModernSelect>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Mulai (opsional)</label>
                            <input type="date" {...register('start_date')} className="input-dark w-full" />
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Selesai (opsional)</label>
                            <input type="date" {...register('end_date')} className="input-dark w-full" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary"><CalendarRange size={13} /> Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
