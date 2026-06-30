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

export default function TabJadwal({ teachers }) {
    const [schedules, setSchedules]   = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects]     = useState([]);
    const [filterCls, setFilterCls]   = useState('');
    const [viewMode, setViewMode]     = useState('grid'); // 'grid' | 'list'
    const [isOpen, setIsOpen]         = useState(false);
    const [editId, setEditId]         = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchAll = async () => {
        try {
            const [sr, cr, subr] = await Promise.all([
                api.get('/schedules' + (filterCls ? `?classroom_id=${filterCls}` : '')),
                api.get('/classrooms'),
                api.get('/subjects'),
            ]);
            setSchedules(sr.data.data || []);
            setClassrooms(cr.data.data || []);
            setSubjects(subr.data.data || []);
        } catch { swal({ title:'Error', text:'Gagal memuat jadwal', icon:'error' }); }
    };
    useEffect(() => { fetchAll(); }, [filterCls]);

    const openCreate = () => { reset({ classroom_id:'', subject_id:'', teacher_id:'', day:'Senin', start_time:'07:00', end_time:'08:00', room:'' }); setEditId(null); setIsOpen(true); };
    const openEdit   = (s) => { reset({ ...s, start_time: s.start_time?.slice(0,5), end_time: s.end_time?.slice(0,5) }); setEditId(s.id); setIsOpen(true); };

    const onSubmit = async (data) => {
        try {
            editId ? await api.put(`/schedules/${editId}`, data) : await api.post('/schedules', data);
            swal({ title:'Sukses!', text: editId ? 'Jadwal diperbarui.' : 'Jadwal ditambahkan.', icon:'success', timer:1500, showConfirmButton:false });
            setIsOpen(false); fetchAll();
        } catch (e) { swal({ title:'Error', text: e.response?.data?.message || 'Gagal menyimpan', icon:'error' }); }
    };

    const handleDelete = (id) => swal({
        title:'Hapus jadwal?', icon:'warning', showCancelButton:true,
        confirmButtonColor:'#ef4444', cancelButtonColor:'#374151',
        confirmButtonText:'Ya, Hapus!', cancelButtonText:'Batal',
    }).then(async r => { if (r.isConfirmed) { await api.delete(`/schedules/${id}`); fetchAll(); } });

    /* Group by day for grid view */
    const byDay = DAYS.reduce((acc, d) => {
        acc[d] = schedules.filter(s => s.day === d).sort((a, b) => a.start_time?.localeCompare(b.start_time));
        return acc;
    }, {});

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:'var(--text-muted)' }}/>
                    <ModernSelect value={filterCls} onChange={e => setFilterCls(e.target.value)} className="input-dark pr-8 text-sm w-44 appearance-none">
                        <option value="">Semua Kelas</option>
                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </ModernSelect>
                </div>

                {/* View mode toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl"
                    style={{ background:'var(--bg-input)', border:'1px solid var(--border-input)' }}>
                    {[{id:'grid',label:'Grid'},{id:'list',label:'List'}].map(v => (
                        <button key={v.id} onClick={() => setViewMode(v.id)}
                            className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                            style={{
                                background: viewMode===v.id ? 'linear-gradient(135deg,#6366f1,#818cf8)' : 'transparent',
                                color: viewMode===v.id ? '#fff' : 'var(--text-secondary)',
                            }}>{v.label}</button>
                    ))}
                </div>

                <div className="flex-1"/>
                <button onClick={openCreate} className="btn-primary"><PlusCircle size={13}/> Tambah Jadwal</button>
            </div>

            {/* â”€â”€ GRID VIEW â”€â”€ */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {DAYS.map(day => {
                        const cfg = DAY_COLOR[day];
                        const slots = byDay[day] || [];
                        return (
                            <div key={day} className="rounded-2xl overflow-hidden"
                                style={{ background:'var(--bg-card)', border:`1px solid ${cfg.border}`, boxShadow:'var(--shadow-card)' }}>
                                {/* Day Header */}
                                <div className="px-4 py-3 flex items-center justify-between"
                                    style={{ background: cfg.bg, borderBottom:`1px solid ${cfg.border}` }}>
                                    <span className="text-sm font-bold" style={{ color: cfg.color }}>{day}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                        style={{ background: cfg.bg, color: cfg.color, border:`1px solid ${cfg.border}` }}>
                                        {slots.length} sesi
                                    </span>
                                </div>
                                {/* Slots */}
                                <div className="p-3 space-y-2">
                                    {slots.length === 0 ? (
                                        <p className="text-xs text-center py-4" style={{ color:'var(--text-muted)' }}>Tidak ada jadwal</p>
                                    ) : slots.map(s => (
                                        <div key={s.id} className="rounded-xl p-3 transition-all duration-150"
                                            style={{ background:'var(--bg-input)', border:'1px solid var(--border-input)' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = cfg.border}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-input)'}
                                        >
                                            <div className="flex items-start justify-between gap-1">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate" style={{ color:'var(--text-primary)' }}>
                                                        {s.subject?.name || '-'}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        <span className="text-xs flex items-center gap-1" style={{ color:'var(--text-muted)' }}>
                                                            <Clock size={9}/> {s.start_time?.slice(0,5)}â€“{s.end_time?.slice(0,5)}
                                                        </span>
                                                        {s.classroom && (
                                                            <span className="text-xs flex items-center gap-1" style={{ color:'var(--text-muted)' }}>
                                                                <Users size={9}/> {s.classroom.name}
                                                            </span>
                                                        )}
                                                        {s.room && (
                                                            <span className="text-xs flex items-center gap-1" style={{ color:'var(--text-muted)' }}>
                                                                <MapPin size={9}/> {s.room}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {s.teacher && (
                                                        <p className="text-xs mt-1 truncate" style={{ color: cfg.color }}>
                                                            {s.teacher.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <ActionBtn bg="rgba(99,102,241,0.1)" color="#818cf8" border="rgba(99,102,241,0.2)" hoverBg="rgba(99,102,241,0.22)" icon={<Edit size={11}/>} onClick={() => openEdit(s)} title="Edit"/>
                                                    <ActionBtn bg="rgba(239,68,68,0.1)" color="#f87171" border="rgba(239,68,68,0.2)" hoverBg="rgba(239,68,68,0.22)" icon={<Trash2 size={11}/>} onClick={() => handleDelete(s.id)} title="Hapus"/>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* â”€â”€ LIST VIEW â”€â”€ */}
            {viewMode === 'list' && (
                <div className="rounded-2xl overflow-hidden"
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)', boxShadow:'var(--shadow-card)' }}>
                    {schedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Calendar size={32} style={{ color:'var(--text-muted)', marginBottom:8 }}/>
                            <p className="text-sm font-semibold" style={{ color:'var(--text-secondary)' }}>Belum ada jadwal</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-table-head)' }}>
                                    {['Hari','Kelas','Mata Pelajaran','Waktu','Ruangan','Guru','Aksi'].map((h,i) => (
                                        <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color:'var(--text-th)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map((s, i) => {
                                    const cfg = DAY_COLOR[s.day] || DAY_COLOR['Senin'];
                                    return (
                                        <tr key={s.id}
                                            style={{ borderBottom:'1px solid var(--border)', background:i%2!==0?'var(--bg-table-even)':'transparent' }}
                                            onMouseEnter={e => e.currentTarget.style.background='var(--bg-table-hover)'}
                                            onMouseLeave={e => e.currentTarget.style.background=i%2!==0?'var(--bg-table-even)':'transparent'}
                                        >
                                            <td className="py-3 px-4">
                                                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                                                    style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                                                    {s.day}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm" style={{ color:'var(--text-secondary)' }}>{s.classroom?.name || '-'}</td>
                                            <td className="py-3 px-4 text-sm font-medium" style={{ color:'var(--text-primary)' }}>{s.subject?.name || '-'}</td>
                                            <td className="py-3 px-4 text-xs font-mono" style={{ color:'var(--text-secondary)' }}>
                                                {s.start_time?.slice(0,5)} â€“ {s.end_time?.slice(0,5)}
                                            </td>
                                            <td className="py-3 px-4 text-xs" style={{ color:'var(--text-muted)' }}>{s.room || '-'}</td>
                                            <td className="py-3 px-4 text-xs" style={{ color:'var(--text-secondary)' }}>{s.teacher?.name || '-'}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <ActionBtn bg="rgba(99,102,241,0.1)" color="#818cf8" border="rgba(99,102,241,0.2)" hoverBg="rgba(99,102,241,0.22)" icon={<Edit size={13}/>} onClick={() => openEdit(s)} title="Edit"/>
                                                    <ActionBtn bg="rgba(239,68,68,0.1)" color="#f87171" border="rgba(239,68,68,0.2)" hoverBg="rgba(239,68,68,0.22)" icon={<Trash2 size={13}/>} onClick={() => handleDelete(s.id)} title="Hapus"/>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Schedule Form Modal */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Edit Jadwal' : 'Tambah Jadwal'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Kelas</label>
                            <ModernSelect {...register('classroom_id',{required:true})} className="input-dark">
                                <option value="">--- Pilih Kelas ---</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </ModernSelect>
                            {errors.classroom_id && <span className="text-xs mt-1 block" style={{color:'#f87171'}}>Wajib dipilih</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Mata Pelajaran</label>
                            <ModernSelect {...register('subject_id',{required:true})} className="input-dark">
                                <option value="">--- Pilih Mapel ---</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </ModernSelect>
                            {errors.subject_id && <span className="text-xs mt-1 block" style={{color:'#f87171'}}>Wajib dipilih</span>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Guru</label>
                            <ModernSelect {...register('teacher_id')} className="input-dark">
                                <option value="">--- Pilih Guru ---</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </ModernSelect>
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Hari</label>
                            <ModernSelect {...register('day',{required:true})} className="input-dark">
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </ModernSelect>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Jam Mulai</label>
                            <input type="time" {...register('start_time',{required:true})} className="input-dark"/>
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Jam Selesai</label>
                            <input type="time" {...register('end_time',{required:true})} className="input-dark"/>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Ruangan (Opsional)</label>
                        <input {...register('room')} className="input-dark" placeholder="Lab Komputer, Kelas 12, dll"/>
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

