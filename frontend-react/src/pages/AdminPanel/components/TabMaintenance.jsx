import { useState } from 'react';
import { Wrench, Trash2, ShieldAlert } from 'lucide-react';
import api from '../../../api/axios';
import Swal from 'sweetalert2';

export default function TabMaintenance() {
    const [isClearing, setIsClearing] = useState(false);

    const handleClearCache = async () => {
        const confirm = await Swal.fire({
            title: 'Bersihkan Cache?',
            text: 'Tindakan ini akan menghapus cache aplikasi, rute, konfigurasi, dan view. Berguna jika sistem terasa lambat atau ada perubahan yang belum muncul.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Bersihkan',
            cancelButtonText: 'Batal',
            customClass: {
                confirmButton: 'btn-success',
                cancelButton: 'btn-ghost mr-3',
                actions: 'flex flex-row-reverse gap-3'
            },
            buttonsStyling: false,
            background: 'var(--bg-modal)',
            color: 'var(--text-primary)'
        });

        if (confirm.isConfirmed) {
            setIsClearing(true);
            Swal.fire({
                title: 'Sedang Membersihkan...',
                text: 'Harap tunggu.',
                allowOutsideClick: false,
                background: 'var(--bg-modal)',
                color: 'var(--text-primary)',
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const res = await api.post('/maintenance/clear-cache');
                Swal.fire({
                    title: 'Berhasil!',
                    text: res.data.message || 'Cache berhasil dibersihkan.',
                    icon: 'success',
                    background: 'var(--bg-modal)',
                    color: 'var(--text-primary)',
                });
            } catch (err) {
                Swal.fire({ 
                    title: 'Gagal', 
                    text: 'Terjadi kesalahan saat membersihkan cache.', 
                    icon: 'error', 
                    background: 'var(--bg-modal)', 
                    color: 'var(--text-primary)' 
                });
            } finally {
                setIsClearing(false);
            }
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>
                    <Wrench size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Perawatan Sistem</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Optimalkan kinerja dan pastikan aplikasi berjalan lancar
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clear Cache Section */}
                <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex gap-4 items-start mb-6">
                        <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-lg" style={{ color: 'var(--text-primary)' }}>Clear System Cache</h3>
                            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                                Menghapus data sementara (cache) yang disimpan server. Lakukan ini secara berkala atau setelah melakukan pembaruan besar agar sistem membaca data terbaru.
                            </p>
                            <button 
                                onClick={handleClearCache}
                                disabled={isClearing}
                                className="w-full flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}
                            >
                                <Trash2 size={18} />
                                {isClearing ? 'Membersihkan...' : 'Bersihkan Cache'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Section */}
                <div className="p-6 rounded-2xl border relative overflow-hidden opacity-70" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex gap-4 items-start mb-6">
                        <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-lg" style={{ color: 'var(--text-primary)' }}>Maintenance Mode</h3>
                            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                                Kunci aplikasi sementara waktu untuk mencegah pengguna biasa (Siswa/Guru) mengakses sistem saat Anda sedang melakukan perbaikan darurat.
                            </p>
                            <button 
                                disabled
                                className="w-full flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg, #9ca3af, #6b7280)' }}
                            >
                                <ShieldAlert size={18} />
                                Segera Hadir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
