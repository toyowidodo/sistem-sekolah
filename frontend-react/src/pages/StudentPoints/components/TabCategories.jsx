import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, AlertOctagon, Award, Save, X } from 'lucide-react';
import api from '../../../api/axios';
import Swal from 'sweetalert2';

export default function TabCategories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'pelanggaran',
        point_value: 10
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/point-categories');
            setCategories(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingId) {
                await api.put(`/point-categories/${editingId}`, formData);
                Swal.fire({ title: 'Berhasil', text: 'Kategori diperbarui', icon: 'success', background: 'var(--bg-modal)', color: 'var(--text-primary)' });
            } else {
                await api.post('/point-categories', formData);
                Swal.fire({ title: 'Berhasil', text: 'Kategori ditambahkan', icon: 'success', background: 'var(--bg-modal)', color: 'var(--text-primary)' });
            }
            setShowForm(false);
            fetchCategories();
        } catch (err) {
            Swal.fire({ title: 'Gagal', text: err.response?.data?.message || 'Terjadi kesalahan', icon: 'error', background: 'var(--bg-modal)', color: 'var(--text-primary)' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Hapus Kategori?',
            text: 'Data yang dihapus tidak bisa dikembalikan',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            customClass: { confirmButton: 'btn-danger', cancelButton: 'btn-ghost mr-3', actions: 'flex flex-row-reverse gap-3' },
            buttonsStyling: false,
            background: 'var(--bg-modal)',
            color: 'var(--text-primary)'
        });

        if (confirm.isConfirmed) {
            try {
                await api.delete(`/point-categories/${id}`);
                fetchCategories();
            } catch (err) {
                Swal.fire({ title: 'Gagal', text: 'Gagal menghapus kategori', icon: 'error', background: 'var(--bg-modal)', color: 'var(--text-primary)' });
            }
        }
    };

    const openEdit = (cat) => {
        setEditingId(cat.id);
        setFormData({ name: cat.name, type: cat.type, point_value: cat.point_value });
        setShowForm(true);
    };

    const openCreate = () => {
        setEditingId(null);
        setFormData({ name: '', type: 'pelanggaran', point_value: 10 });
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            {!showForm ? (
                <>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Daftar Kategori Poin</h2>
                        <button onClick={openCreate} className="btn-primary">
                            <Plus size={18} /> Tambah Kategori
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pelanggaran */}
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4 text-red-500">
                                <AlertOctagon size={24} />
                                <h3 className="font-bold text-lg">Pelanggaran</h3>
                            </div>
                            <div className="space-y-3">
                                {categories.filter(c => c.type === 'pelanggaran').map(cat => (
                                    <div key={cat.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--bg-input)' }}>
                                        <div>
                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</div>
                                            <div className="text-sm font-bold text-red-500">-{cat.point_value} Poin</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(cat)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                {categories.filter(c => c.type === 'pelanggaran').length === 0 && (
                                    <div className="text-sm italic" style={{ color: 'var(--text-muted)' }}>Belum ada data pelanggaran</div>
                                )}
                            </div>
                        </div>

                        {/* Prestasi */}
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4 text-emerald-500">
                                <Award size={24} />
                                <h3 className="font-bold text-lg">Prestasi</h3>
                            </div>
                            <div className="space-y-3">
                                {categories.filter(c => c.type === 'prestasi').map(cat => (
                                    <div key={cat.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--bg-input)' }}>
                                        <div>
                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</div>
                                            <div className="text-sm font-bold text-emerald-500">+{cat.point_value} Poin</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(cat)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                {categories.filter(c => c.type === 'prestasi').length === 0 && (
                                    <div className="text-sm italic" style={{ color: 'var(--text-muted)' }}>Belum ada data prestasi</div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="card p-6 max-w-xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                        </h2>
                        <button onClick={() => setShowForm(false)} className="btn-ghost !p-2">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Jenis Kategori</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="type" value="pelanggaran" checked={formData.type === 'pelanggaran'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-4 h-4 text-indigo-600" />
                                    <span style={{ color: 'var(--text-primary)' }}>Pelanggaran</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="type" value="prestasi" checked={formData.type === 'prestasi'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-4 h-4 text-indigo-600" />
                                    <span style={{ color: 'var(--text-primary)' }}>Prestasi</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nama Kategori (Contoh: Terlambat, Merokok, Juara 1)</label>
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input-dark" placeholder="Masukkan nama kategori" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nilai Poin (Angka positif)</label>
                            <input type="number" min="1" required value={formData.point_value} onChange={(e) => setFormData({...formData, point_value: e.target.value})} className="input-dark" />
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {formData.type === 'pelanggaran' ? 'Ini akan dihitung sebagai poin MINUS (Pinalti).' : 'Ini akan dihitung sebagai poin PLUS (Bonus).'}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Batal</button>
                            <button type="submit" disabled={isLoading} className="btn-primary">
                                <Save size={18} /> {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
