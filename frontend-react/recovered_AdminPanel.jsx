import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import {
    Shield, Users, Activity, PlusCircle, Edit, Trash2,
    Search, RefreshCw, Key, Clock, Database, User,
    ChevronDown, CheckCircle, XCircle, Zap, AlertTriangle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';

/* ── Helpers ── */
const swal = (opts) => Swal.fire({ background: '#0d1526', color: '#e2e8f0', ...opts });
const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-1.5';
const labelStyle = { color: 'var(--text-label)' };

const ROLE_CFG = {
    'Superadmin':     { color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   icon: Shield },
    'Admin Sekolah':  { color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  icon: Users },
    'Guru':           { color: '#34d399', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  icon: User },
    'Tata Usaha':     { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  icon: User },
    'Bendahara':      { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  icon: User },
    'Siswa':          { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)',  icon: User },
    'Orang Tua':      { color: '#67e8f9', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.25)',   icon: User },
};

const EVENT_CFG = {
    created: { color: '#34d399', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.2)',  icon: PlusCircle, label: 'Dibuat' },
    updated: { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.2)',  icon: Edit,       label: 'Diubah' },
    deleted: { color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.2)',   icon: Trash2,     label: 'Dihapus' },
    default: { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.2)', icon: Zap,        label: 'Aktivitas' },
};

const fmtDate = (d) => d ? new Date(d).toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-';

const ActionBtn = ({ bg, color, border, hoverBg, icon, onClick, title }) => (
    <button onClick={onClick} title={title}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
        style={{ background: bg, color, border: `1px solid ${border}` }}
        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
        onMouseLeave={e => e.currentTarget.style.background = bg}
    >{icon}</button>
);

/* ═══════════════════════════════════
   TAB 1 — USER MANAGEMENT
═══════════════════════════════════ */
function TabUsers() {
    const [users, setUsers]   = useState([]);
    const [roles, setRoles]   = useState([]);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetch = async () => {
        try {
            const r = await api.get('/users');
            setUsers(r.data.data || []);
            setRoles(r.data.roles || []);
        } catch { swal({ title:'Error', text:'Gagal memuat user', icon:'error' }); }
    };
    useEffect(() => { fetch(); }, []);

    const filtered = search
        ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
        : users;

    const openCreate = () => { reset({ name:'', email:'', password:'', role:'' }); setEditId(null); setIsOpen(true); };
    const openEdit   = (u) => { reset({ name:u.name, email:u.email, password:'', role: u.roles?.[0] || '' }); setEditId(u.id); setIsOpen(true); };

    const onSubmit = async (data) => {
        try {
            editId ? await api.put(`/users/${editId}`, data) : await api.post('/users', data);
            swal({ title:'Sukses!', text: editId ? 'User diperbarui.' : 'User berhasil dibuat.', icon:'success', timer:1500, showConfirmButton:false });
            setIsOpen(false); fetch();
        } catch (e) { swal({ title:'Error', text: e.response?.data?.message || 'Terjadi kesalahan', icon:'error' }); }
    };

    const handleDelete = (id, name) => swal({
        title: `Hapus user "${name}"?`,
        text: 'Semua token user akan dicabut!',
        icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444', cancelButtonColor: '#374151',
        confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
    }).then(async r => {
        if (r.isConfirmed) {
            try { await api.delete(`/users/${id}`); fetch(); swal({ title:'Terhapus!', icon:'success', timer:1200, showConfirmButton:false }); }
            catch (e) { swal({ title:'Error', text: e.response?.data?.message || 'Gagal', icon:'error' }); }
        }
    });

    const handleToggle = async (id, name) => {
        try {
            await api.post(`/users/${id}/toggle-active`);
            swal({ title:'Sukses', text:`Token ${name} telah dicabut (paksa logout).`, icon:'success', timer:1800, showConfirmButton:false });
        } catch (e) { swal({ title:'Error', text: e.response?.data?.message || 'Gagal', icon:'error' }); }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:'var(--text-muted)' }}/>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama atau email..." className="input-dark pl-9 text-sm w-full"/>
                </div>
                <button onClick={fetch} className="btn-ghost text-xs"><RefreshCw size={13}/> Refresh</button>
                <button onClick={openCreate} className="btn-primary text-xs"><PlusCircle size={13}/> Tambah User</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label:'Total User', value: users.length, color:'#818cf8', bg:'rgba(99,102,241,0.1)', border:'rgba(99,102,241,0.2)' },
                    { label:'Superadmin', value: users.filter(u=>u.roles?.includes('Superadmin')).length, color:'#f87171', bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.2)' },
                    { label:'Guru',       value: users.filter(u=>u.roles?.includes('Guru')).length,       color:'#34d399', bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.2)' },
                    { label:'Lainnya',    value: users.filter(u=>!u.roles?.includes('Superadmin')&&!u.roles?.includes('Guru')).length, color:'#fbbf24', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.2)' },
                ].map((s,i) => (
                    <div key={i} className="rounded-xl p-3"
                        style={{ background: s.bg, border:`1px solid ${s.border}` }}>
                        <p className="text-xs mb-1" style={{ color:'var(--text-label)' }}>{s.label}</p>
                        <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* User Table */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)', boxShadow:'var(--shadow-card)' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-table-head)' }}>
                            {['User','Email','Role','Bergabung','Aksi'].map((h,i) => (
                                <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color:'var(--text-th)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="py-12 text-center text-sm" style={{ color:'var(--text-muted)' }}>Tidak ada data user</td></tr>
                        ) : filtered.map((u, i) => {
                            const role = u.roles?.[0];
                            const rcfg = ROLE_CFG[role] || ROLE_CFG['Tata Usaha'];
                            return (
                                <tr key={u.id}
                                    style={{ borderBottom:'1px solid var(--border)', background:i%2!==0?'var(--bg-table-even)':'transparent' }}
                                    onMouseEnter={e => e.currentTarget.style.background='var(--bg-table-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background=i%2!==0?'var(--bg-table-even)':'transparent'}
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                style={{ background:'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                                                {u.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium" style={{ color:'var(--text-primary)' }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm" style={{ color:'var(--text-secondary)' }}>{u.email}</td>
                                    <td className="py-3 px-4">
                                        {role ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                                style={{ background:rcfg.bg, color:rcfg.color, border:`1px solid ${rcfg.border}` }}>
                                                <rcfg.icon size={10}/> {role}
                                            </span>
                                        ) : <span className="text-xs" style={{ color:'var(--text-muted)' }}>—</span>}
                                    </td>
                                    <td className="py-3 px-4 text-xs" style={{ color:'var(--text-muted)' }}>
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5">
                                            <ActionBtn bg="rgba(245,158,11,0.1)" color="#fbbf24" border="rgba(245,158,11,0.2)" hoverBg="rgba(245,158,11,0.22)"
                                                icon={<Key size={12}/>} onClick={() => handleToggle(u.id, u.name)} title="Paksa Logout (Cabut Token)"/>
                                            <ActionBtn bg="rgba(99,102,241,0.1)" color="#818cf8" border="rgba(99,102,241,0.2)" hoverBg="rgba(99,102,241,0.22)"
                                                icon={<Edit size={12}/>} onClick={() => openEdit(u)} title="Edit User"/>
                                            <ActionBtn bg="rgba(239,68,68,0.1)" color="#f87171" border="rgba(239,68,68,0.2)" hoverBg="rgba(239,68,68,0.22)"
                                                icon={<Trash2 size={12}/>} onClick={() => handleDelete(u.id, u.name)} title="Hapus User"/>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="px-4 py-3 text-xs" style={{ borderTop:'1px solid var(--border)', color:'var(--text-footer)' }}>
                    {filtered.length} dari {users.length} user
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Edit User' : 'Tambah User Baru'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Nama Lengkap</label>
                            <input {...register('name',{required:true})} className="input-dark" placeholder="Nama user"/>
                            {errors.name && <span className="text-xs mt-1 block" style={{color:'#f87171'}}>Wajib diisi</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Email</label>
                            <input type="email" {...register('email',{required:true})} className="input-dark" placeholder="email@sekolah.id"/>
                            {errors.email && <span className="text-xs mt-1 block" style={{color:'#f87171'}}>Email valid wajib diisi</span>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Password {editId && <span className="normal-case font-normal opacity-60">(kosongkan = tidak berubah)</span>}</label>
                            <input type="password" {...register('password',{required:!editId, minLength:6})} className="input-dark" placeholder="Min. 6 karakter"/>
                            {errors.password && <span className="text-xs mt-1 block" style={{color:'#f87171'}}>Min. 6 karakter</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Role</label>
                            <select {...register('role',{required:true})} className="input-dark">
                                <option value="">--- Pilih Role ---</option>
                                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                            {errors.role && <span className="text-xs mt-1 block" style={{color:'#f87171'}}>Wajib dipilih</span>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop:'1px solid var(--border)' }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary"><Shield size={13}/> Simpan User</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

/* ═══════════════════════════════════
   TAB 2 — ACTIVITY LOG
═══════════════════════════════════ */
function TabActivityLog() {
    const [logs, setLogs]       = useState([]);
    const [total, setTotal]     = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch]   = useState('');
    const [dateFilter, setDate] = useState('');
    const [expanded, setExpanded] = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (dateFilter) params.set('date', dateFilter);
            const r = await api.get(`/activity-logs?${params}`);
            setLogs(r.data.data || []);
            setTotal(r.data.total || 0);
        } catch { swal({ title:'Error', text:'Gagal memuat activity log', icon:'error' }); }
        finally { setLoading(false); }
    }, [search, dateFilter]);

    useEffect(() => { fetch(); }, [fetch]);

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:'var(--text-muted)' }}/>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari aktivitas atau deskripsi..." className="input-dark pl-9 text-sm w-full"/>
                </div>
                <input type="date" value={dateFilter} onChange={e => setDate(e.target.value)} className="input-dark text-sm w-36"/>
                {dateFilter && <button onClick={() => setDate('')} className="btn-ghost text-xs">Reset</button>}
                <button onClick={fetch} className="btn-ghost text-xs"><RefreshCw size={13}/> Refresh</button>
                <span className="text-xs" style={{ color:'var(--text-muted)' }}>{total} aktivitas</span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(EVENT_CFG).filter(([k]) => k !== 'default').map(([key, cfg]) => {
                    const count = logs.filter(l => l.event === key).length;
                    return (
                        <div key={key} className="rounded-xl p-3"
                            style={{ background: cfg.bg, border:`1px solid ${cfg.border}` }}>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs" style={{ color:'var(--text-label)' }}>{cfg.label}</p>
                                <cfg.icon size={12} style={{ color: cfg.color }}/>
                            </div>
                            <p className="text-xl font-bold" style={{ color: cfg.color }}>{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Timeline */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#818cf8" strokeWidth="4"/>
                        <path className="opacity-75" fill="#818cf8" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <p className="text-sm" style={{ color:'var(--text-muted)' }}>Memuat log...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="rounded-2xl flex flex-col items-center justify-center py-16"
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)' }}>
                    <Activity size={32} style={{ color:'var(--text-muted)', marginBottom:8 }}/>
                    <p className="font-semibold text-sm" style={{ color:'var(--text-secondary)' }}>Tidak ada aktivitas</p>
                    <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>Belum ada data activity log yang cocok</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[22px] top-0 bottom-0 w-px" style={{ background:'var(--border)' }}/>

                    <div className="space-y-2 pl-12">
                        {logs.map((log, i) => {
                            const ecfg = EVENT_CFG[log.event] || EVENT_CFG.default;
                            const isExp = expanded === log.id;
                            const props = log.properties;
                            const hasProps = props && (props.attributes || props.old);

                            return (
                                <div key={log.id} className="relative">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[34px] top-3.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                                        style={{ background: ecfg.bg, border:`2px solid ${ecfg.border}` }}>
                                        <ecfg.icon size={9} style={{ color: ecfg.color }}/>
                                    </div>

                                    <div className="rounded-xl p-3.5 transition-all duration-200"
                                        style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background='var(--bg-card-hover)'; e.currentTarget.style.borderColor=ecfg.border; }}
                                        onMouseLeave={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.borderColor='var(--border-card)'; }}
                                    >
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Event badge */}
                                                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                                        style={{ background:ecfg.bg, color:ecfg.color, border:`1px solid ${ecfg.border}` }}>
                                                        {ecfg.label}
                                                    </span>
                                                    {/* Subject type */}
                                                    {log.subject_type && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                                                            style={{ background:'rgba(99,102,241,0.1)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>
                                                            <Database size={8} className="inline mr-0.5"/>{log.subject_type}
                                                            {log.subject_id && <span className="opacity-60"> #{log.subject_id}</span>}
                                                        </span>
                                                    )}
                                                    {/* Log name */}
                                                    {log.log_name && log.log_name !== 'default' && (
                                                        <span className="text-xs" style={{ color:'var(--text-muted)' }}>[{log.log_name}]</span>
                                                    )}
                                                </div>
                                                <p className="text-sm mt-1.5 font-medium" style={{ color:'var(--text-primary)' }}>
                                                    {log.description}
                                                </p>
                                            </div>
                                            {/* Right meta */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-medium" style={{ color:'var(--text-secondary)' }}>{log.causer_name}</p>
                                                <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
                                                    <Clock size={9} className="inline mr-0.5"/>{fmtDate(log.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Expandable properties */}
                                        {hasProps && (
                                            <div className="mt-2">
                                                <button onClick={() => setExpanded(isExp ? null : log.id)}
                                                    className="text-xs flex items-center gap-1 transition-colors duration-150"
                                                    style={{ color: ecfg.color }}>
                                                    <ChevronDown size={11} style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}/>
                                                    {isExp ? 'Sembunyikan detail' : 'Lihat detail perubahan'}
                                                </button>
                                                {isExp && (
                                                    <div className="mt-2 p-3 rounded-lg text-xs font-mono overflow-x-auto"
                                                        style={{ background:'var(--bg-input)', border:'1px solid var(--border-input)', color:'var(--text-secondary)' }}>
                                                        <pre>{JSON.stringify(props, null, 2)}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════ */
export default function AdminPanel() {
    const [tab, setTab] = useState('users');

    const tabs = [
        { id:'users',    label:'Manajemen User',   icon: Users },
        { id:'activity', label:'Activity Log',     icon: Activity },
    ];

    return (
        <div className="p-6 space-y-5">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'linear-gradient(135deg, #ef4444, #f87171)', boxShadow:'0 4px 12px rgba(239,68,68,0.35)' }}>
                    <Shield size={18} className="text-white"/>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold" style={{ color:'var(--text-primary)' }}>Panel Superadmin</h1>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)' }}>
                            <Shield size={9} className="inline mr-0.5"/> SUPERADMIN ONLY
                        </span>
                    </div>
                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>Kelola user, role, dan pantau seluruh aktivitas sistem</p>
                </div>
            </div>

            {/* Warning banner */}
            <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
                <AlertTriangle size={15} style={{ color:'#fbbf24', flexShrink:0 }}/>
                <p className="text-xs" style={{ color:'#fbbf24' }}>
                    Halaman ini hanya dapat diakses oleh <strong>Superadmin</strong>. Setiap perubahan akan tercatat di Activity Log.
                </p>
            </div>

            {/* Tab Switch */}
            <div className="flex items-center gap-1 p-1 rounded-xl w-fit"
                style={{ background:'var(--bg-input)', border:'1px solid var(--border-input)' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={{
                            background: tab===t.id ? 'linear-gradient(135deg,#ef4444,#f87171)' : 'transparent',
                            color: tab===t.id ? '#fff' : 'var(--text-secondary)',
                            boxShadow: tab===t.id ? '0 2px 8px rgba(239,68,68,0.35)' : 'none',
                        }}>
                        <t.icon size={13}/> {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === 'users'    && <TabUsers/>}
            {tab === 'activity' && <TabActivityLog/>}
        </div>
    );
}
