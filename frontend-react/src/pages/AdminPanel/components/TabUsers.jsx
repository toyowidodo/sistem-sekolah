import { useEffect, useState, useCallback } from 'react';
import api from '../../../api/axios';
import Modal from '../../../components/Modal';
import {
    Shield, Users, Activity, PlusCircle, Edit, Trash2,
    Search, RefreshCw, Key, Clock, Database, User,
    ChevronDown, CheckCircle, XCircle, Zap, AlertTriangle, ToggleRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { swal, labelClass, labelStyle, ROLE_CFG, EVENT_CFG, fmtDate, ActionBtn } from './Shared';
import ModernSelect from '../../../components/ModernSelect';

export default function TabUsers() {
    const [users, setUsers]   = useState([]);
    const [roles, setRoles]   = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('Semua');
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

    const filtered = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'Semua' || u.roles?.includes(roleFilter);
        return matchesSearch && matchesRole;
    });

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
                <button onClick={fetch} className="btn-ghost"><RefreshCw size={13}/> Refresh</button>
                <button onClick={openCreate} className="btn-primary"><PlusCircle size={13}/> Tambah User</button>
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

            {/* Content Container: Vertical Tabs + User Table */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Role Filter Tabs (Vertical Sidebar) */}
                <div className="flex flex-col gap-1 p-2 rounded-xl w-full md:w-56 flex-shrink-0"
                    style={{ background:'var(--bg-input)', border:'1px solid var(--border-input)' }}>
                    <p className="text-xs font-bold px-2 pb-2 pt-1 mb-1 border-b border-[var(--border)] text-gray-500 uppercase tracking-wider">
                        Filter Role
                    </p>
                    {['Semua', ...new Set(roles.map(r => r.name))].map((role, idx) => (
                        <button key={`${role}-${idx}`} onClick={() => setRoleFilter(role)}
                            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 text-left w-full"
                            style={{
                                background: roleFilter === role ? 'linear-gradient(135deg,#6366f1,#06b6d4)' : 'transparent',
                                color: roleFilter === role ? '#fff' : 'var(--text-secondary)',
                                boxShadow: roleFilter === role ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
                            }}>
                            {role}
                        </button>
                    ))}
                </div>

                {/* User Table */}
                <div className="flex-1 min-w-0 rounded-2xl overflow-hidden w-full"
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
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate" style={{ color:'var(--text-primary)' }}>{u.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm truncate max-w-[120px]" style={{ color:'var(--text-secondary)' }} title={u.email}>{u.email}</td>
                                        <td className="py-3 px-4">
                                            {role ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                                                    style={{ background:rcfg.bg, color:rcfg.color, border:`1px solid ${rcfg.border}` }}>
                                                    <rcfg.icon size={10}/> {role}
                                                </span>
                                            ) : <span className="text-xs" style={{ color:'var(--text-muted)' }}>â€”</span>}
                                        </td>
                                        <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color:'var(--text-muted)' }}>
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <ActionBtn bg="rgba(245,158,11,0.1)" color="#fbbf24" border="rgba(245,158,11,0.2)" hoverBg="rgba(245,158,11,0.22)"
                                                    icon={<Key size={12}/>} onClick={() => handleToggle(u.id, u.name)} title="Paksa Logout"/>
                                                <ActionBtn bg="rgba(99,102,241,0.1)" color="#818cf8" border="rgba(99,102,241,0.2)" hoverBg="rgba(99,102,241,0.22)"
                                                    icon={<Edit size={12}/>} onClick={() => openEdit(u)} title="Edit"/>
                                                <ActionBtn bg="rgba(239,68,68,0.1)" color="#f87171" border="rgba(239,68,68,0.2)" hoverBg="rgba(239,68,68,0.22)"
                                                    icon={<Trash2 size={12}/>} onClick={() => handleDelete(u.id, u.name)} title="Hapus"/>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-4 py-3 text-xs" style={{ borderTop:'1px solid var(--border)', color:'var(--text-footer)' }}>
                        Menampilkan {filtered.length} dari total {users.length} user
                    </div>
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
                            <ModernSelect {...register('role',{required:true})} className="input-dark">
                                <option value="">--- Pilih Role ---</option>
                                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </ModernSelect>
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TAB 2 â€” ACTIVITY LOG
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
