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
import ModernSelect from '../../../components/ModernSelect';

export default function TabKelas({ teachers }) {
    const [classrooms, setClassrooms] = useState([]);
    const [isOpen, setIsOpen]         = useState(false);
    const [editId, setEditId]         = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetch = async () => {
        try { const r = await api.get('/classrooms'); setClassrooms(r.data.data || []); }
        catch { swal({ title: 'Error', text: 'Gagal memuat kelas', icon: 'error' }); }
    };
    useEffect(() => { fetch(); }, []);

    const openCreate = () => { reset({ name:'', grade_level:'X', major:'', homeroom_teacher_id:'', capacity:30 }); setEditId(null); setIsOpen(true); };
    const openEdit   = (c) => { reset(c); setEditId(c.id); setIsOpen(true); };

    const onSubmit = async (data) => {
        try {
            editId ? await api.put(`/classrooms/${editId}`, data) : await api.post('/classrooms', data);
            swal({ title:'Sukses!', text: editId ? 'Kelas diperbarui.' : 'Kelas berhasil dibuat.', icon:'success', timer:1500, showConfirmButton:false });
            setIsOpen(false); fetch();
        } catch (e) { swal({ title:'Error', text: e.response?.data?.message || 'Terjadi kesalahan', icon:'error' }); }
    };

    const handleDelete = (id) => swal({
        title:'Hapus kelas?', text:'Data tidak bisa dikembalikan!', icon:'warning',
        showCancelButton:true, confirmButtonColor:'#ef4444', cancelButtonColor:'#374151',
        confirmButtonText:'Ya, Hapus!', cancelButtonText:'Batal',
    }).then(async r => { if (r.isConfirmed) { await api.delete(`/classrooms/${id}`); fetch(); } });

    const byGrade = DAYS.reduce((acc, _) => acc, {});
    const grades = ['X','XI','XII'];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{classrooms.length} kelas terdaftar</p>
                <button onClick={openCreate} className="btn-primary"><PlusCircle size={13}/> Tambah Kelas</button>
            </div>

            {/* Group by grade */}
            {grades.map(grade => {
                const cls = classrooms.filter(c => c.grade_level === grade);
                if (!cls.length) return null;
                return (
                    <div key={grade}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-3 py-0.5 rounded-full text-xs font-bold text-white"
                                style={{ background: GRADE_COLOR[grade] || 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                                Kelas {grade}
                            </div>
                            <div className="flex-1 h-px" style={{ background: 'var(--border)' }}/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {cls.map(c => (
                                <div key={c.id} className="rounded-xl p-4 transition-all duration-200"
                                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)', boxShadow:'var(--shadow-card)' }}
                                    onMouseEnter={e => { e.currentTarget.style.background='var(--bg-card-hover)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.transform='translateY(0)'; }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                                style={{ background: GRADE_COLOR[c.grade_level] || 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                                                {c.grade_level}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm" style={{ color:'var(--text-primary)' }}>{c.name}</p>
                                                {c.major && <p className="text-xs" style={{ color:'var(--text-muted)' }}>{c.major}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ActionBtn bg="rgba(99,102,241,0.1)" color="#818cf8" border="rgba(99,102,241,0.2)" hoverBg="rgba(99,102,241,0.22)" icon={<Edit size={12}/>} onClick={() => openEdit(c)} title="Edit"/>
                                            <ActionBtn bg="rgba(239,68,68,0.1)" color="#f87171" border="rgba(239,68,68,0.2)" hoverBg="rgba(239,68,68,0.22)" icon={<Trash2 size={12}/>} onClick={() => handleDelete(c.id)} title="Hapus"/>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-3 text-xs" style={{ color:'var(--text-muted)' }}>
                                        <span className="flex items-center gap-1"><Users size={10}/> {c.capacity} siswa</span>
                                        {c.homeroom_teacher && <span className="flex items-center gap-1"><GraduationCap size={10}/> {c.homeroom_teacher.name}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {classrooms.length === 0 && (
                <div className="rounded-2xl flex flex-col items-center justify-center py-16"
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)' }}>
                    <School size={32} style={{ color:'var(--text-muted)', marginBottom:8 }}/>
                    <p className="font-semibold text-sm" style={{ color:'var(--text-secondary)' }}>Belum ada kelas</p>
                    <button onClick={openCreate} className="btn-primary mt-3"><PlusCircle size={12}/> Tambah Kelas</button>
                </div>
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Edit Kelas' : 'Tambah Kelas Baru'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Nama Kelas</label>
                            <input {...register('name',{required:true})} className="input-dark" placeholder="X IPA 1"/>
                            {errors.name && <span className="text-xs mt-1 block" style={{color:'#f87171'}}>Wajib diisi</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Tingkat</label>
                            <ModernSelect {...register('grade_level',{required:true})} className="input-dark">
                                {['X','XI','XII'].map(g => <option key={g} value={g}>Kelas {g}</option>)}
                            </ModernSelect>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Jurusan</label>
                            <input {...register('major')} className="input-dark" placeholder="IPA, IPS, dll"/>
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Kapasitas</label>
                            <input type="number" {...register('capacity')} className="input-dark" defaultValue={30} min={1}/>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Wali Kelas</label>
                        <ModernSelect {...register('homeroom_teacher_id')} className="input-dark">
                            <option value="">--- Pilih Wali Kelas ---</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </ModernSelect>
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

