import { useState, useEffect } from 'react';
import { Search, Save, User } from 'lucide-react';
import api from '../../../api/axios';
import Swal from 'sweetalert2';
import ModernSelect from '../../../components/ModernSelect';
import ModernDatepicker from '../../../components/ModernDatepicker';

export default function TabRecords() {
    const [students, setStudents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [formData, setFormData] = useState({
        point_category_id: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        fetchStudents();
        fetchCategories();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students');
            setStudents(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

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
        if (!selectedStudent || !formData.point_category_id) {
            Swal.fire({ title: 'Perhatian', text: 'Pilih siswa dan kategori terlebih dahulu.', icon: 'warning', background: 'var(--bg-modal)', color: 'var(--text-primary)' });
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/student-points', {
                student_id: selectedStudent.id,
                ...formData
            });
            Swal.fire({ title: 'Berhasil', text: 'Catatan poin berhasil disimpan.', icon: 'success', background: 'var(--bg-modal)', color: 'var(--text-primary)' });
            
            // Reset form
            setSelectedStudent(null);
            setSearchTerm('');
            setFormData({ point_category_id: '', date: new Date().toISOString().split('T')[0], notes: '' });
        } catch (err) {
            Swal.fire({ title: 'Gagal', text: err.response?.data?.message || 'Gagal menyimpan catatan.', icon: 'error', background: 'var(--bg-modal)', color: 'var(--text-primary)' });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.nisn.includes(searchTerm)
    ).slice(0, 5); // show max 5 results

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cari Siswa */}
            <div className="lg:col-span-1 space-y-4">
                <div className="card p-5">
                    <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>1. Pilih Siswa</h3>
                    
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3" size={18} style={{ color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            className="input-dark pl-10" 
                            placeholder="Cari nama / NISN siswa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {searchTerm && !selectedStudent && (
                        <div className="space-y-2 mt-2">
                            {filteredStudents.map(student => (
                                <button 
                                    key={student.id}
                                    onClick={() => {
                                        setSelectedStudent(student);
                                        setSearchTerm('');
                                    }}
                                    className="w-full text-left p-3 rounded-xl hover:bg-indigo-500/10 transition-colors flex items-center gap-3"
                                    style={{ background: 'var(--bg-input)' }}
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{student.name}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{student.nisn}</div>
                                    </div>
                                </button>
                            ))}
                            {filteredStudents.length === 0 && (
                                <div className="text-sm p-2 text-center" style={{ color: 'var(--text-muted)' }}>Tidak ditemukan siswa.</div>
                            )}
                        </div>
                    )}

                    {selectedStudent && (
                        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 relative">
                            <button onClick={() => setSelectedStudent(null)} className="absolute top-2 right-2 text-xs text-red-500 font-medium">Batal</button>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{selectedStudent.name}</div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>NISN: {selectedStudent.nisn}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Input */}
            <div className="lg:col-span-2">
                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>2. Catat Pelanggaran / Prestasi</h3>
                    
                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Tanggal Kejadian</label>
                                <ModernDatepicker  required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="input-dark" disabled={!selectedStudent} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Kategori Poin</label>
                                <ModernSelect required value={formData.point_category_id} onChange={(e) => setFormData({...formData, point_category_id: e.target.value})} className="input-dark" disabled={!selectedStudent}>
                                    <option value="">-- Pilih Kategori --</option>
                                    <optgroup label="🔴 PELANGGARAN">
                                        {categories.filter(c => c.type === 'pelanggaran').map(c => (
                                            <option key={c.id} value={c.id}>{c.name} (-{c.point_value} Poin)</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="🟢 PRESTASI">
                                        {categories.filter(c => c.type === 'prestasi').map(c => (
                                            <option key={c.id} value={c.id}>{c.name} (+{c.point_value} Poin)</option>
                                        ))}
                                    </optgroup>
                                </ModernSelect>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Catatan (Opsional)</label>
                            <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="input-dark min-h-[100px] resize-y" placeholder="Tambahkan detail kejadian jika diperlukan..." disabled={!selectedStudent}></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={isLoading || !selectedStudent} className="btn-primary w-full md:w-auto px-8">
                                <Save size={18} /> {isLoading ? 'Menyimpan...' : 'Simpan Catatan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
