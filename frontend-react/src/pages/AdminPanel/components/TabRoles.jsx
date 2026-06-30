import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import Modal from '../../../components/Modal';
import { Shield, ToggleRight } from 'lucide-react';
import { swal, ROLE_CFG } from './Shared';

export default function TabRoles() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPerms, setSelectedPerms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRoles = async () => {
        try {
            const r = await api.get('/roles');
            setRoles(r.data.data || []);
        } catch { swal({ title:'Error', text:'Gagal memuat roles', icon:'error' }); }
    };

    const fetchPermissions = async () => {
        try {
            const r = await api.get('/permissions');
            setPermissions(r.data.data || []);
        } catch {}
    };

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const openRoleModal = (role) => {
        if (role.name === 'Superadmin') {
            swal({ title: 'Akses Ditolak', text: 'Hak akses Superadmin tidak dapat diubah (Failsafe).', icon: 'error' });
            return;
        }
        setSelectedRole(role);
        // mapping current permissions
        const current = role.permissions.map(p => p.name);
        setSelectedPerms(current);
        setIsModalOpen(true);
    };

    const handleTogglePerm = (permName) => {
        if (selectedPerms.includes(permName)) {
            setSelectedPerms(selectedPerms.filter(p => p !== permName));
        } else {
            setSelectedPerms([...selectedPerms, permName]);
        }
    };

    const handleSave = async () => {
        try {
            await api.put(`/roles/${selectedRole.id}`, { permissions: selectedPerms });
            swal({ title: 'Sukses!', text: 'Hak akses berhasil disimpan.', icon: 'success', timer: 1500, showConfirmButton: false });
            setIsModalOpen(false);
            fetchRoles();
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal menyimpan', icon: 'error' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {roles.map(r => {
                    const cfg = ROLE_CFG[r.name] || ROLE_CFG['Siswa'];
                    return (
                        <div key={r.id} className="p-4 rounded-xl flex flex-col justify-between"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                            <div>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                    style={{ background: cfg.bg, color: cfg.color }}>
                                    <cfg.icon size={18} />
                                </div>
                                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{r.name}</h3>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                    {r.name === 'Superadmin' ? 'Akses penuh ke seluruh sistem' : `${r.permissions?.length || 0} hak akses khusus`}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[var(--border)]">
                                <button onClick={() => openRoleModal(r)} 
                                    className={`w-full text-xs font-semibold px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${r.name === 'Superadmin' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'}`}>
                                    {r.name === 'Superadmin' ? <Shield size={14}/> : <ToggleRight size={14}/>}
                                    {r.name === 'Superadmin' ? 'Terkunci (Failsafe)' : 'Atur Hak Akses'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Atur Hak Akses: ${selectedRole?.name}`}>
                <div className="space-y-3">
                    <p className="text-xs text-gray-400 mb-4">Pilih fitur apa saja yang bisa diakses oleh <strong>{selectedRole?.name}</strong>:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                        {permissions.map(p => {
                            const isChecked = selectedPerms.includes(p.name);
                            return (
                                <label key={p.id} className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                                    style={{ background: isChecked ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)', border: `1px solid ${isChecked ? 'rgba(99,102,241,0.3)' : 'var(--border-input)'}` }}>
                                    <div className="mt-0.5">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-800" 
                                            checked={isChecked} onChange={() => handleTogglePerm(p.name)} />
                                    </div>
                                    <div>
                                        <p className={`font-semibold text-sm ${isChecked ? 'text-indigo-400' : 'text-gray-300'}`}>{p.name}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)] mt-4">
                        <button onClick={() => setIsModalOpen(false)} className="btn-ghost">Batal</button>
                        <button onClick={handleSave} className="btn-primary">Simpan Perubahan</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
