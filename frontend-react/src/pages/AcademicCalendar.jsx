import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import {
    Calendar, ChevronLeft, ChevronRight, PlusCircle, Edit, Trash2,
    Star, AlertTriangle, BookOpen, GraduationCap, Users as UsersIcon,
    Coffee, Clock, MoreHorizontal, List, LayoutGrid
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import ModernSelect from '../components/ModernSelect';
import ModernDatepicker from '../components/ModernDatepicker';

const swal = (opts) => Swal.fire({ background: '#0d1526', color: '#e2e8f0', ...opts });

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const CAT_CFG = {
    akademik: { color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)', icon: BookOpen,      label: 'Akademik' },
    ujian:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)', icon: GraduationCap, label: 'Ujian' },
    libur:    { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   icon: Coffee,        label: 'Libur' },
    kegiatan: { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  icon: Star,          label: 'Kegiatan' },
    rapat:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)',  icon: UsersIcon,     label: 'Rapat' },
    lainnya:  { color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)', icon: MoreHorizontal,label: 'Lainnya' },
};

const PRIORITY_CFG = {
    normal:  { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
    penting: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
    urgent:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)' },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-1.5';
const labelStyle = { color: 'var(--text-label)' };

export default function AcademicCalendar() {
    const [events, setEvents]     = useState([]);
    const [month, setMonth]       = useState(new Date().getMonth());
    const [year, setYear]         = useState(new Date().getFullYear());
    const [view, setView]         = useState('calendar'); // calendar | list
    const [catFilter, setCatFilter] = useState('all');
    const [isOpen, setIsOpen]     = useState(false);
    const [editId, setEditId]     = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchEvents = useCallback(async () => {
        try {
            const params = new URLSearchParams({ month: month + 1, year });
            if (catFilter !== 'all') params.set('category', catFilter);
            const r = await api.get(`/academic-events?${params}`);
            setEvents(r.data.data || []);
        } catch { }
    }, [month, year, catFilter]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    /* â”€â”€ Calendar grid â”€â”€ */
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevDays = new Date(year, month, 0).getDate();
        const days = [];

        // Previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: prevDays - i, current: false, date: new Date(year, month - 1, prevDays - i) });
        }
        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, current: true, date: new Date(year, month, i) });
        }
        // Next month fill
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, current: false, date: new Date(year, month + 1, i) });
        }
        return days;
    }, [month, year]);

    const getEventsForDate = (date) => {
        return events.filter(e => {
            const start = new Date(e.start_date);
            const end = e.end_date ? new Date(e.end_date) : start;
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            const d = new Date(date);
            d.setHours(12, 0, 0, 0);
            return d >= start && d <= end;
        });
    };

    /* â”€â”€ Navigation â”€â”€ */
    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
    const goToday = () => { setMonth(new Date().getMonth()); setYear(new Date().getFullYear()); };

    /* â”€â”€ CRUD â”€â”€ */
    const openCreate = (dateStr) => {
        reset({ title: '', description: '', start_date: dateStr || '', end_date: '', category: 'akademik', priority: 'normal', color: '', is_holiday: false });
        setEditId(null); setIsOpen(true);
    };
    const openEdit = (evt) => {
        reset({
            title: evt.title, description: evt.description || '',
            start_date: evt.start_date?.split('T')[0], end_date: evt.end_date?.split('T')[0] || '',
            category: evt.category, priority: evt.priority, color: evt.color || '', is_holiday: evt.is_holiday,
        });
        setEditId(evt.id); setIsOpen(true);
    };

    const onSubmit = async (data) => {
        try {
            const payload = { ...data, is_holiday: !!data.is_holiday, end_date: data.end_date || null };
            editId ? await api.put(`/academic-events/${editId}`, payload) : await api.post('/academic-events', payload);
            swal({ title: 'Sukses!', text: editId ? 'Event diperbarui.' : 'Event berhasil dibuat.', icon: 'success', timer: 1500, showConfirmButton: false });
            setIsOpen(false); fetchEvents();
        } catch (e) { swal({ title: 'Error', text: e.response?.data?.message || 'Terjadi kesalahan', icon: 'error' }); }
    };

    const handleDelete = (evt) => swal({
        title: `Hapus "${evt.title}"?`, icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444', cancelButtonColor: '#374151',
        confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
    }).then(async r => {
        if (r.isConfirmed) {
            try { await api.delete(`/academic-events/${evt.id}`); fetchEvents(); } catch { }
        }
    });

    const today = new Date();

    /* â”€â”€ Stats â”€â”€ */
    const stats = Object.entries(CAT_CFG).map(([key, cfg]) => ({
        ...cfg, key, count: events.filter(e => e.category === key).length,
    }));

    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                    <Calendar size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Kalender Akademik</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Jadwal event, ujian, libur, dan kegiatan sekolah</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-input)'}>
                        <ChevronLeft size={16} />
                    </button>
                    <h2 className="text-base font-bold px-2 min-w-36 text-center" style={{ color: 'var(--text-primary)' }}>
                        {MONTHS[month]} {year}
                    </h2>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-input)'}>
                        <ChevronRight size={16} />
                    </button>
                    <button onClick={goToday} className="btn-ghost ml-1">Hari Ini</button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Category filter pills */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                        <button onClick={() => setCatFilter('all')}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                            style={{ background: catFilter === 'all' ? 'rgba(99,102,241,0.2)' : 'transparent', color: catFilter === 'all' ? '#818cf8' : 'var(--text-muted)' }}>
                            Semua
                        </button>
                        {Object.entries(CAT_CFG).slice(0, 4).map(([key, cfg]) => (
                            <button key={key} onClick={() => setCatFilter(key)}
                                className="px-2 py-1 rounded-md text-xs font-semibold transition-all"
                                style={{ background: catFilter === key ? cfg.bg : 'transparent', color: catFilter === key ? cfg.color : 'var(--text-muted)' }}>
                                {cfg.label}
                            </button>
                        ))}
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                        {[{ id: 'calendar', icon: LayoutGrid }, { id: 'list', icon: List }].map(v => (
                            <button key={v.id} onClick={() => setView(v.id)}
                                className="p-1.5 rounded-md transition-all" title={v.id === 'calendar' ? 'Tampilan Kalender' : 'Tampilan Daftar'}
                                style={{ background: view === v.id ? 'rgba(99,102,241,0.2)' : 'transparent', color: view === v.id ? '#818cf8' : 'var(--text-muted)' }}>
                                <v.icon size={14} />
                            </button>
                        ))}
                    </div>

                    <button onClick={() => openCreate('')} className="btn-primary">
                        <PlusCircle size={13} /> Tambah Event
                    </button>
                </div>
            </div>

            {/* Category stats */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {stats.map(s => (
                    <div key={s.key} className="rounded-xl p-2.5 text-center cursor-pointer transition-all duration-150"
                        style={{ background: s.bg, border: `1px solid ${catFilter === s.key ? s.color : s.border}`, opacity: catFilter !== 'all' && catFilter !== s.key ? 0.4 : 1 }}
                        onClick={() => setCatFilter(catFilter === s.key ? 'all' : s.key)}>
                        <s.icon size={14} className="mx-auto mb-1" style={{ color: s.color }} />
                        <p className="text-xs font-semibold" style={{ color: s.color }}>{s.count}</p>
                        <p className="text-xs" style={{ color: s.color, opacity: 0.7 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* â”€â”€ CALENDAR VIEW â”€â”€ */}
            {view === 'calendar' && (
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                    {/* Day headers */}
                    <div className="grid grid-cols-7">
                        {DAYS.map((d, i) => (
                            <div key={i} className="py-2.5 text-center text-xs font-bold uppercase tracking-wider"
                                style={{ color: i === 0 ? '#f87171' : 'var(--text-th)', borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                                {d}
                            </div>
                        ))}
                    </div>
                    {/* Days grid */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((d, i) => {
                            const dayEvents = d.current ? getEventsForDate(d.date) : [];
                            const isToday = d.current && isSameDay(d.date, today);
                            const isSunday = d.date.getDay() === 0;
                            const hasHoliday = dayEvents.some(e => e.is_holiday);
                            const isSelected = selectedDay && isSameDay(d.date, selectedDay);

                            return (
                                <div key={i}
                                    className="min-h-24 p-1 transition-all duration-100 cursor-pointer relative"
                                    style={{
                                        borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                                        borderBottom: '1px solid var(--border)',
                                        background: isSelected ? 'rgba(99,102,241,0.06)' : !d.current ? 'var(--bg-table-even)' : 'transparent',
                                        opacity: d.current ? 1 : 0.35,
                                    }}
                                    onClick={() => { if (d.current) setSelectedDay(d.date); }}
                                    onDoubleClick={() => { if (d.current) openCreate(d.date.toISOString().split('T')[0]); }}
                                >
                                    {/* Day number */}
                                    <div className="flex items-center justify-between px-0.5">
                                        <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'text-white' : ''}`}
                                            style={{
                                                color: isToday ? '#fff' : isSunday || hasHoliday ? '#f87171' : 'var(--text-secondary)',
                                                background: isToday ? '#6366f1' : 'transparent',
                                            }}>
                                            {d.day}
                                        </span>
                                    </div>
                                    {/* Events */}
                                    <div className="mt-0.5 space-y-0.5">
                                        {dayEvents.slice(0, 3).map(evt => {
                                            const cfg = CAT_CFG[evt.category] || CAT_CFG.lainnya;
                                            return (
                                                <div key={evt.id}
                                                    className="px-1.5 py-0.5 rounded text-xs font-medium truncate cursor-pointer transition-all"
                                                    style={{ background: cfg.bg, color: cfg.color, borderLeft: `2px solid ${cfg.color}` }}
                                                    onClick={e => { e.stopPropagation(); openEdit(evt); }}
                                                    title={evt.title}>
                                                    {evt.title}
                                                </div>
                                            );
                                        })}
                                        {dayEvents.length > 3 && (
                                            <p className="text-xs px-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
                                                +{dayEvents.length - 3} lagi
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* â”€â”€ LIST VIEW â”€â”€ */}
            {view === 'list' && (
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Calendar size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Tidak ada event</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Klik "Tambah Event" untuk membuat event baru</p>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {events.map((evt, i) => {
                                const cfg = CAT_CFG[evt.category] || CAT_CFG.lainnya;
                                const pcfg = PRIORITY_CFG[evt.priority] || PRIORITY_CFG.normal;
                                return (
                                    <div key={evt.id} className="flex items-center gap-4 p-4 transition-all duration-150"
                                        style={{ borderBottom: '1px solid var(--border)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-table-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        {/* Date box */}
                                        <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                            <p className="text-lg font-black leading-none" style={{ color: cfg.color }}>
                                                {new Date(evt.start_date).getDate()}
                                            </p>
                                            <p className="text-xs font-semibold" style={{ color: cfg.color, opacity: 0.7 }}>
                                                {MONTHS[new Date(evt.start_date).getMonth()]?.slice(0, 3)}
                                            </p>
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{evt.title}</p>
                                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                                    {cfg.label}
                                                </span>
                                                {evt.priority !== 'normal' && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                                        style={{ background: pcfg.bg, color: pcfg.color, border: `1px solid ${pcfg.border}` }}>
                                                        {evt.priority === 'urgent' && <AlertTriangle size={9} className="inline mr-0.5" />}
                                                        {evt.priority}
                                                    </span>
                                                )}
                                                {evt.is_holiday && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                        ðŸ– Libur
                                                    </span>
                                                )}
                                            </div>
                                            {evt.description && (
                                                <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{evt.description}</p>
                                            )}
                                            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                                <Clock size={9} />
                                                {fmtDate(evt.start_date)}
                                                {evt.end_date && evt.end_date !== evt.start_date && ` â€” ${fmtDate(evt.end_date)}`}
                                            </p>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button onClick={() => openEdit(evt)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.22)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}>
                                                <Edit size={12} />
                                            </button>
                                            <button onClick={() => handleDelete(evt)}
                                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.22)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="px-4 py-3 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-footer)' }}>
                        {events.length} event Â· {MONTHS[month]} {year}
                    </div>
                </div>
            )}

            {/* â”€â”€ Selected Day Detail â”€â”€ */}
            {view === 'calendar' && selectedDay && (() => {
                const dayEvts = getEventsForDate(selectedDay);
                return (
                    <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                {selectedDay.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                            <button onClick={() => openCreate(selectedDay.toISOString().split('T')[0])}
                                className="text-xs flex items-center gap-1 font-semibold" style={{ color: '#818cf8' }}>
                                <PlusCircle size={12} /> Tambah
                            </button>
                        </div>
                        {dayEvts.length === 0 ? (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tidak ada event di hari ini</p>
                        ) : (
                            <div className="space-y-2">
                                {dayEvts.map(evt => {
                                    const cfg = CAT_CFG[evt.category] || CAT_CFG.lainnya;
                                    return (
                                        <div key={evt.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold" style={{ color: cfg.color }}>{evt.title}</p>
                                                {evt.description && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: cfg.color, opacity: 0.7 }}>{evt.description}</p>}
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(evt)} className="p-1 rounded" style={{ color: cfg.color }}><Edit size={12} /></button>
                                                <button onClick={() => handleDelete(evt)} className="p-1 rounded" style={{ color: '#f87171' }}><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* â”€â”€ Modal â”€â”€ */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Edit Event' : 'Tambah Event Baru'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className={labelClass} style={labelStyle}>Judul Event</label>
                        <input {...register('title', { required: true })} className="input-dark w-full" placeholder="Mis: Ujian Tengah Semester" />
                        {errors.title && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Deskripsi</label>
                        <textarea {...register('description')} rows={2} className="input-dark w-full resize-none" placeholder="Detail event (opsional)" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Tanggal Mulai</label>
                            <ModernDatepicker  {...register('start_date', { required: true })} className="input-dark w-full" />
                            {errors.start_date && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Tanggal Selesai</label>
                            <ModernDatepicker  {...register('end_date')} className="input-dark w-full" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Kategori</label>
                            <ModernSelect {...register('category', { required: true })} className="input-dark w-full">
                                {Object.entries(CAT_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </ModernSelect>
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Prioritas</label>
                            <ModernSelect {...register('priority')} className="input-dark w-full">
                                <option value="normal">Normal</option>
                                <option value="penting">Penting</option>
                                <option value="urgent">Urgent</option>
                            </ModernSelect>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs"
                            style={{ color: 'var(--text-secondary)' }}>
                            <input type="checkbox" {...register('is_holiday')}
                                className="w-4 h-4 rounded" style={{ accentColor: '#ef4444' }} />
                            <Coffee size={12} style={{ color: '#f87171' }} /> Tandai sebagai Hari Libur
                        </label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary"><Calendar size={13} /> {editId ? 'Perbarui' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
