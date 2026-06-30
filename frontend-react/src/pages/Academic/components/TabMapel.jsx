import { useEffect, useState, useCallback } from 'react';
import api from '../../../api/axios';
import Modal from '../../../components/Modal';
import {
    BookOpen, PlusCircle, Edit, Trash2, GraduationCap,
    Calendar, Users, Clock, ChevronDown, School, Hash,
    MapPin, BookMarked
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { swal, labelClass, labelStyle, DAYS, DAY_COLOR, GRADE_COLOR, ActionBtn } from './Shared';

export default function TabMapel() {
    const [subjects, setSubjects] = useState([]);
    const [isOpen, setIsOpen]     = useState(false);
    const [editId, setEditId]     = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetch = async () => {
        try { const r = await api.get('/subjects'); setSubjects(r.data.data || []); }
        catch { swal({ title:'Error', text:'Gagal memuat mata pelajaran', icon:'error' }); }
    };
    useEffect(() => { fetch(); }, []);

    const openCreate = () => { reset({ code:'', name:'', description:'', hours_per_week:2 }); setEditId(null); setIsOpen(true); };
    const openEdit   = (s) => { reset(s); setEditId(s.id); setIsOpen(true); };

    const onSubmit = async (data) => {
        try {
            editId ? await api.put(`/subjects/${editId}`, data) : await api.post('/subjects', data);
            swal({ title:'Sukses!', text: editId ? 'Mata pelajaran diperbarui.' : 'Mata pelajaran ditambahkan.', icon:'success', timer:1500, showConfirmButton:false });
            setIsOpen(false); fetch();
        } catch (e) { swal({ title:'Error', text: e.response?.data?.message || 'Gagal menyimpan', icon:'error' }); }
    };

    const handleDelete = (id) => swal({
        title:'Hapus mata pelajaran?', icon:'warning', showCancelButton:true,
        confirmButtonColor:'#ef4444', cancelButtonColor:'#374151',
        confirmButtonText:'Ya, Hapus!', cancelButtonText:'Batal',
    }).then(async r => { if (r.isConfirmed) { await api.delete(`/subjects/${id}`); fetch(); } });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color:'var(--text-muted)' }}>{subjects.length} mata pelajaran</p>
                <button onClick={openCreate} className="btn-primary"><PlusCircle size={13}/> Tambah Mapel</button>
            </div>

            <div className="rounded-2xl overflow-hidden"
                style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)', boxShadow:'var(--shadow-card)' }}>
                {subjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <BookMarked size={32} style={{ color:'var(--text-muted)', marginBottom:8 }}/>
                        <p className="text-sm font-semibold" style={{ color:'var(--text-secondary)' }}>Belum ada mata pelajaran</p>
                        <button onClick={openCreate} className="btn-primary mt-3"><PlusCircle size={12}/> Tambah</button>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-table-head)' }}>
                                {['Kode', 'Nama Mata Pelajaran', 'Jam/Minggu', 'Deskripsi', 'Aksi'].map((h,i) => (
                                    <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color:'var(--text-th)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((s,i) => (
                                <tr key={s.id}
                                    style={{ borderBottom:'1px solid var(--border)', background: i%2!==0?'var(--bg-table-even)':'transparent' }}
                                    onMouseEnter={e => e.currentTarget.style.background='var(--bg-table-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background=i%2!==0?'var(--bg-table-even)':'transparent'}
                                >
                                    <td className="py-3 px-4">
                                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono"
                                            style={{ background:'rgba(99,102,241,0.12)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>
                                            {s.code}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm font-medium" style={{ color:'var(--text-primary)' }}>{s.name}</td>
                                    <td className="py-3 px-4">
                                        <span className="flex items-center gap-1 text-xs" style={{ color:'var(--text-secondary)' }}>
                                            <Clock size={11}/> {s.hours_per_week} jam/minggu
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-xs max-w-xs truncate" style={{ color:'var(--text-muted)' }}>
                                        {s.description || '-'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <ActionBtn bg="rgba(99,102,241,0.1)" color="#818cf8" border="rgba(99,102,241,0.2)" hoverBg="rgba(99,102,241,0.22)" icon={<Edit size={13}/>} onClick={() => openEdit(s)} title="Edit"/>
                                            <ActionBtn bg="rgba(239,68,68,0.1)" color="#f87171" border="rgba(239,68,68,0.2)" hoverBg="rgba(239,68,68,0.22)" icon={<Trash2 size={13}/>} onClick={() => handleDelete(s.id)} title="Hapus"/>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Kode Mapel</label>
                            <input {...register('code',{required:true})} className="input-dark font-mono" placeholder="MTK"/>
                            {errors.code && <span className="text-xs mt-1 block" style={{color:'#f87171'}}>Wajib & unik</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Jam / Minggu</label>
                            <input type="number" {...register('hours_per_week')} className="input-dark" defaultValue={2} min={1}/>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Nama Mata Pelajaran</label>
                        <input {...register('name',{required:true})} className="input-dark" placeholder="Matematika"/>
                        {errors.name && <span className="text-xs mt-1 block" style={{color:'#f87171'}}>Wajib diisi</span>}
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Deskripsi (Opsional)</label>
                        <textarea {...register('description')} className="input-dark resize-none" rows={2} placeholder="Deskripsi singkat mata pelajaran"/>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop:'1px solid var(--border)' }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

