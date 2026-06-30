import { useState, useEffect } from 'react';
import { Settings, Save, Building, Phone, Mail, MapPin, Calendar, BookOpen } from 'lucide-react';
import api from '../../../api/axios';
import { swal } from './Shared';
import ModernSelect from '../../../components/ModernSelect';

export default function TabSettings() {
    const [settings, setSettings] = useState({
        school_name: '',
        school_address: '',
        school_phone: '',
        school_email: '',
        active_academic_year: '',
        active_semester: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data.data) {
                setSettings((prev) => ({ ...prev, ...res.data.data }));
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/settings', settings);
            swal({ title: 'Sukses!', text: 'Pengaturan sistem berhasil diperbarui.', icon: 'success' });
        } catch (err) {
            swal({ title: 'Gagal', text: 'Terjadi kesalahan saat menyimpan pengaturan.', icon: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                    <Settings size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Pengaturan Sistem</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Kelola informasi dasar sekolah dan status akademik
                    </p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Identitas Sekolah */}
                    <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Building size={18} className="text-indigo-500" />
                            Identitas Sekolah
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Nama Sekolah</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building size={15} className="text-gray-400" />
                                    </div>
                                    <input type="text" name="school_name" value={settings.school_name || ''} onChange={handleChange} required
                                        className="w-full pl-9 pr-3 py-2 rounded-xl text-sm transition-colors"
                                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Email Resmi</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={15} className="text-gray-400" />
                                    </div>
                                    <input type="email" name="school_email" value={settings.school_email || ''} onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2 rounded-xl text-sm transition-colors"
                                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>No. Telepon</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={15} className="text-gray-400" />
                                    </div>
                                    <input type="text" name="school_phone" value={settings.school_phone || ''} onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2 rounded-xl text-sm transition-colors"
                                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Alamat Lengkap</label>
                                <div className="relative">
                                    <div className="absolute top-2.5 left-3 pointer-events-none">
                                        <MapPin size={15} className="text-gray-400" />
                                    </div>
                                    <textarea name="school_address" rows="3" value={settings.school_address || ''} onChange={handleChange}
                                        className="w-full pl-9 pr-3 py-2 rounded-xl text-sm transition-colors resize-none"
                                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pengaturan Akademik */}
                    <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Calendar size={18} className="text-amber-500" />
                            Pengaturan Akademik
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg flex items-start gap-3 mb-4" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
                                <BookOpen size={20} className="flex-shrink-0 mt-0.5" />
                                <p className="text-xs leading-relaxed">
                                    Pengaturan ini menentukan Tahun Ajaran dan Semester aktif yang akan digunakan oleh sistem untuk fitur SPP, Nilai, dan Jadwal.
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Tahun Ajaran Aktif</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar size={15} className="text-gray-400" />
                                    </div>
                                    <ModernSelect name="active_academic_year" value={settings.active_academic_year || ''} onChange={handleChange} required
                                        className="w-full pl-9 pr-3 py-2 rounded-xl text-sm transition-colors appearance-none"
                                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }}>
                                        <option value="">Pilih Tahun Ajaran</option>
                                        <option value="2023/2024">2023/2024</option>
                                        <option value="2024/2025">2024/2025</option>
                                        <option value="2025/2026">2025/2026</option>
                                        <option value="2026/2027">2026/2027</option>
                                    </ModernSelect>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Semester Aktif</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="active_semester" value="Ganjil" checked={settings.active_semester === 'Ganjil'} onChange={handleChange}
                                            className="w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Ganjil</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="active_semester" value="Genap" checked={settings.active_semester === 'Genap'} onChange={handleChange}
                                            className="w-4 h-4 text-indigo-500 bg-gray-700 border-gray-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Genap</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-70"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
                        <Save size={18} />
                        {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
