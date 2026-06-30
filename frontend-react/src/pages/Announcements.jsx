import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import {
    Megaphone, PlusCircle, Edit, Trash2, Search, Filter,
    AlertTriangle, Star, Info, BookOpen, CalendarDays, Clock,
    Eye, EyeOff, ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import ModernSelect from '../components/ModernSelect';
import ModernDatepicker from '../components/ModernDatepicker';

/* â”€â”€ Config â”€â”€ */
const CATEGORY_CFG = {
    umum:      { label: 'Umum',     color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  icon: Info },
    akademik:  { label: 'Akademik', color: '#a78bfa', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', icon: BookOpen },
    kegiatan:  { label: 'Kegiatan', color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: CalendarDays },
    darurat:   { label: 'Darurat',  color: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  icon: AlertTriangle },
};

const PRIORITY_CFG = {
    normal:  { label: 'Normal',  color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.20)' },
    penting: { label: 'Penting', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)'  },
    urgent:  { label: 'Urgent',  color: '#f87171', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.30)'   },
};

const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-1.5';
const labelStyle = { color: 'var(--text-label)' };

/* â”€â”€ Format date â”€â”€ */
const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

export default function Announcements() {
    const [items, setItems]           = useState([]);
    const [total, setTotal]           = useState(0);
    const [loading, setLoading]       = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId]   = useState(null);
    const [expanded, setExpanded]     = useState(null);
    const [search, setSearch]         = useState('');
    const [filterCat, setFilterCat]   = useState('all');
    const [filterPri, setFilterPri]   = useState('all');

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const watchCategory = watch('category', 'umum');
    const watchPriority = watch('priority', 'normal');

    /* â”€â”€ Fetch â”€â”€ */
    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterCat !== 'all') params.set('category', filterCat);
            if (filterPri !== 'all') params.set('priority', filterPri);
            const res = await api.get(`/announcements?${params}`);
            const data = res.data.data || [];
            const filtered = search
                ? data.filter(a =>
                    a.title.toLowerCase().includes(search.toLowerCase()) ||
                    a.content.toLowerCase().includes(search.toLowerCase())
                  )
                : data;
            setItems(filtered);
            setTotal(res.data.total || data.length);
        } catch {
            Swal.fire({ title: 'Error', text: 'Gagal memuat pengumuman', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        } finally {
            setLoading(false);
        }
    }, [filterCat, filterPri, search]);

    useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

    /* â”€â”€ Open modals â”€â”€ */
    const openCreate = () => {
        reset({ title: '', content: '', category: 'umum', priority: 'normal', is_published: true, expires_at: '' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEdit = (item) => {
        reset({
            title: item.title,
            content: item.content,
            category: item.category,
            priority: item.priority,
            is_published: item.is_published,
            expires_at: item.expires_at ? item.expires_at.split('T')[0] : '',
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    /* â”€â”€ Submit â”€â”€ */
    const onSubmit = async (data) => {
        try {
            const payload = { ...data, is_published: data.is_published === true || data.is_published === 'true' };
            if (editingId) {
                await api.put(`/announcements/${editingId}`, payload);
                Swal.fire({ title: 'Sukses!', text: 'Pengumuman diperbarui.', icon: 'success', background: '#0d1526', color: '#e2e8f0', timer: 1500, showConfirmButton: false });
            } else {
                await api.post('/announcements', payload);
                Swal.fire({ title: 'Sukses!', text: 'Pengumuman berhasil dibuat.', icon: 'success', background: '#0d1526', color: '#e2e8f0', timer: 1500, showConfirmButton: false });
            }
            setIsModalOpen(false);
            fetchAnnouncements();
        } catch (err) {
            Swal.fire({ title: 'Error', text: err.response?.data?.message || 'Terjadi kesalahan', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
    };

    /* â”€â”€ Delete â”€â”€ */
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus pengumuman?',
            text: 'Data tidak bisa dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            background: '#0d1526',
            color: '#e2e8f0',
        }).then(async (result) => {
            if (result.isConfirmed) {
                await api.delete(`/announcements/${id}`);
                Swal.fire({ title: 'Terhapus!', text: 'Pengumuman telah dihapus.', icon: 'success', background: '#0d1526', color: '#e2e8f0', timer: 1200, showConfirmButton: false });
                fetchAnnouncements();
            }
        });
    };

    /* â”€â”€ UI â”€â”€ */
    const actionBtn = (bg, color, border, hoverBg, icon, onClick, title) => (
        <button onClick={onClick} title={title}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
            style={{ background: bg, color, border: `1px solid ${border}` }}
            onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
            onMouseLeave={e => { e.currentTarget.style.background = bg; }}
        >
            {icon}
        </button>
    );

    return (
        <div className="p-6 space-y-5">

            {/* â”€â”€ Page Header â”€â”€ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>
                        <Megaphone size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Pengumuman</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{total} pengumuman terdaftar</p>
                    </div>
                </div>
                <button onClick={openCreate} id="btn-tambah-pengumuman" className="btn-primary">
                    <PlusCircle size={15} /> Buat Pengumuman
                </button>
            </div>

            {/* â”€â”€ Filter Bar â”€â”€ */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari judul atau isi pengumuman..."
                        className="input-dark pl-9 text-sm w-full"
                    />
                </div>
                {/* Category Filter */}
                <div className="relative">
                    <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <ModernSelect value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input-dark pl-8 pr-8 text-sm w-36 appearance-none">
                        <option value="all">Semua Kategori</option>
                        {Object.entries(CATEGORY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </ModernSelect>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                </div>
                {/* Priority Filter */}
                <div className="relative">
                    <Star size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <ModernSelect value={filterPri} onChange={e => setFilterPri(e.target.value)} className="input-dark pl-8 pr-8 text-sm w-32 appearance-none">
                        <option value="all">Semua Prioritas</option>
                        {Object.entries(PRIORITY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </ModernSelect>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                </div>
            </div>

            {/* â”€â”€ Stats Row â”€â”€ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(CATEGORY_CFG).map(([key, cfg]) => {
                    const count = items.filter(a => a.category === key).length;
                    return (
                        <button key={key} onClick={() => setFilterCat(filterCat === key ? 'all' : key)}
                            className="rounded-xl p-3 text-left transition-all duration-200"
                            style={{
                                background: filterCat === key ? cfg.bg : 'var(--bg-card)',
                                border: `1px solid ${filterCat === key ? cfg.border : 'var(--border-card)'}`,
                                boxShadow: 'var(--shadow-card)',
                            }}>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-medium" style={{ color: 'var(--text-label)' }}>{cfg.label}</p>
                                <cfg.icon size={13} style={{ color: cfg.color }} />
                            </div>
                            <p className="text-xl font-bold" style={{ color: cfg.color }}>{count}</p>
                        </button>
                    );
                })}
            </div>

            {/* â”€â”€ Announcements List â”€â”€ */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="4"/>
                        <path className="opacity-75" fill="#f59e0b" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat pengumuman...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl flex flex-col items-center justify-center py-20"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                    <Megaphone size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Belum ada pengumuman</p>
                    <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Klik tombol "Buat Pengumuman" untuk mulai</p>
                    <button onClick={openCreate} className="btn-primary">
                        <PlusCircle size={13} /> Buat Sekarang
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => {
                        const cat = CATEGORY_CFG[item.category] || CATEGORY_CFG.umum;
                        const pri = PRIORITY_CFG[item.priority] || PRIORITY_CFG.normal;
                        const isExpanded = expanded === item.id;

                        return (
                            <div key={item.id}
                                className="rounded-2xl overflow-hidden transition-all duration-300"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-card)',
                                    boxShadow: 'var(--shadow-card)',
                                    borderLeft: `3px solid ${cat.color}`,
                                }}
                            >
                                {/* Card Header */}
                                <div className="flex items-start gap-4 p-4">
                                    {/* Category Icon */}
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                                        <cat.icon size={16} style={{ color: cat.color }} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                    {item.title}
                                                </h3>
                                                {/* Priority Badge */}
                                                {item.priority !== 'normal' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                                                        style={{ background: pri.bg, color: pri.color, border: `1px solid ${pri.border}` }}>
                                                        {item.priority === 'urgent' && <AlertTriangle size={9} />}
                                                        {item.priority === 'penting' && <Star size={9} />}
                                                        {pri.label}
                                                    </span>
                                                )}
                                                {/* Category Badge */}
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                                    style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                                                    {cat.label}
                                                </span>
                                                {/* Published status */}
                                                {!item.is_published && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                                                        style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-muted)', border: '1px solid rgba(148,163,184,0.2)' }}>
                                                        <EyeOff size={9} /> Draft
                                                    </span>
                                                )}
                                            </div>
                                            {/* Actions */}
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {actionBtn('rgba(99,102,241,0.1)', '#818cf8', 'rgba(99,102,241,0.2)', 'rgba(99,102,241,0.22)',
                                                    <Edit size={13} />, () => openEdit(item), 'Edit')}
                                                {actionBtn('rgba(239,68,68,0.1)', '#f87171', 'rgba(239,68,68,0.2)', 'rgba(239,68,68,0.22)',
                                                    <Trash2 size={13} />, () => handleDelete(item.id), 'Hapus')}
                                            </div>
                                        </div>

                                        {/* Preview / Expanded Content */}
                                        <div className="mt-2">
                                            <p className="text-sm leading-relaxed"
                                                style={{
                                                    color: 'var(--text-secondary)',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: isExpanded ? 'unset' : 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: isExpanded ? 'visible' : 'hidden',
                                                    whiteSpace: 'pre-wrap',
                                                }}>
                                                {item.content}
                                            </p>
                                            <button
                                                onClick={() => setExpanded(isExpanded ? null : item.id)}
                                                className="mt-1 text-xs font-medium flex items-center gap-1 transition-colors duration-150"
                                                style={{ color: cat.color }}
                                            >
                                                {isExpanded ? <><EyeOff size={11} /> Sembunyikan</> : <><Eye size={11} /> Baca selengkapnya</>}
                                            </button>
                                        </div>

                                        {/* Footer Meta */}
                                        <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                                            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                <Clock size={10} />
                                                {fmtDate(item.published_at || item.created_at)}
                                            </span>
                                            {item.author?.name && (
                                                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    oleh <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.author.name}</span>
                                                </span>
                                            )}
                                            {item.expires_at && (
                                                <span className="flex items-center gap-1 text-xs" style={{ color: '#fbbf24' }}>
                                                    <CalendarDays size={10} />
                                                    Berakhir: {new Date(item.expires_at).toLocaleDateString('id-ID')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* â”€â”€ Modal Form â”€â”€ */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Title */}
                    <div>
                        <label className={labelClass} style={labelStyle}>Judul Pengumuman</label>
                        <input {...register('title', { required: true })} className="input-dark"
                            placeholder="Judul pengumuman..." />
                        {errors.title && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                    </div>

                    {/* Category & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Kategori</label>
                            <ModernSelect {...register('category')} className="input-dark">
                                {Object.entries(CATEGORY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </ModernSelect>
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Prioritas</label>
                            <ModernSelect {...register('priority')} className="input-dark">
                                {Object.entries(PRIORITY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </ModernSelect>
                        </div>
                    </div>

                    {/* Preview badges */}
                    <div className="flex items-center gap-2">
                        {watchCategory && CATEGORY_CFG[watchCategory] && (() => {
                            const cfg = CATEGORY_CFG[watchCategory];
                            return <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                {cfg.label}
                            </span>;
                        })()}
                        {watchPriority && PRIORITY_CFG[watchPriority] && (() => {
                            const cfg = PRIORITY_CFG[watchPriority];
                            return <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                {cfg.label}
                            </span>;
                        })()}
                    </div>

                    {/* Content */}
                    <div>
                        <label className={labelClass} style={labelStyle}>Isi Pengumuman</label>
                        <textarea {...register('content', { required: true })} className="input-dark resize-none" rows="5"
                            placeholder="Tulis isi pengumuman di sini..." />
                        {errors.content && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                    </div>

                    {/* Expires At & Published */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Berlaku Sampai (Opsional)</label>
                            <ModernDatepicker  {...register('expires_at')} className="input-dark" />
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl transition-all duration-150"
                                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                                <input type="checkbox" {...register('is_published')} defaultChecked className="w-4 h-4 accent-violet-500" />
                                <div>
                                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Publikasikan</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Langsung tampil</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary">
                            <Megaphone size={14} />
                            {editingId ? 'Simpan Perubahan' : 'Publikasikan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
