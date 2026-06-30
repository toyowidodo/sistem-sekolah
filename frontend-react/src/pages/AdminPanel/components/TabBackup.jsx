import { useRef } from 'react';
import { Download, Database, Info, Upload, AlertTriangle } from 'lucide-react';
import api from '../../../api/axios';
import Swal from 'sweetalert2';

export default function TabBackup() {
    const fileInputRef = useRef(null);

    const handleDownloadBackup = async () => {
        Swal.fire({
            title: 'Memproses Backup...',
            text: 'Harap tunggu, sistem sedang membuat snapshot database.',
            allowOutsideClick: false,
            background: 'var(--bg-modal)',
            color: 'var(--text-primary)',
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const res = await api.get('/backup/download', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Format nama file
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `backup-db_sekolah-${date}.sql`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            Swal.close();
            Swal.fire({
                title: 'Berhasil!',
                text: 'Database berhasil di-backup dan diunduh.',
                icon: 'success',
                background: 'var(--bg-modal)',
                color: 'var(--text-primary)',
            });

        } catch (err) {
            Swal.close();
            console.error(err);
            Swal.fire({ 
                title: 'Gagal', 
                text: 'Terjadi kesalahan saat membackup database. Pastikan mysqldump tersedia di server.', 
                icon: 'error', 
                background: 'var(--bg-modal)', 
                color: 'var(--text-primary)' 
            });
        }
    };

    const handleRestoreDatabase = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi tipe file
        if (!file.name.endsWith('.sql')) {
            Swal.fire({
                title: 'Format Tidak Valid',
                text: 'Harap unggah file dengan ekstensi .sql',
                icon: 'warning',
                background: 'var(--bg-modal)',
                color: 'var(--text-primary)',
            });
            fileInputRef.current.value = '';
            return;
        }

        const confirm = await Swal.fire({
            title: 'Peringatan Berbahaya!',
            text: 'Tindakan ini akan MENIMPA (replace) seluruh data saat ini dengan data dari file backup. Pastikan Anda sudah membackup data terbaru. Lanjutkan?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Restore Sekarang',
            cancelButtonText: 'Batal',
            customClass: {
                confirmButton: 'btn-danger',
                cancelButton: 'btn-ghost mr-3',
                actions: 'flex flex-row-reverse gap-3'
            },
            buttonsStyling: false,
            background: 'var(--bg-modal)',
            color: 'var(--text-primary)'
        });

        if (confirm.isConfirmed) {
            Swal.fire({
                title: 'Memproses Restore...',
                text: 'Harap tunggu, jangan tutup halaman ini.',
                allowOutsideClick: false,
                background: 'var(--bg-modal)',
                color: 'var(--text-primary)',
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const formData = new FormData();
                formData.append('backup_file', file);

                await api.post('/backup/restore', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                Swal.close();
                Swal.fire({
                    title: 'Restore Berhasil!',
                    text: 'Database telah berhasil dipulihkan.',
                    icon: 'success',
                    background: 'var(--bg-modal)',
                    color: 'var(--text-primary)',
                });
            } catch (err) {
                Swal.close();
                console.error(err);
                Swal.fire({ 
                    title: 'Gagal', 
                    text: err.response?.data?.message || 'Terjadi kesalahan saat me-restore database.', 
                    icon: 'error', 
                    background: 'var(--bg-modal)', 
                    color: 'var(--text-primary)' 
                });
            }
        }
        
        fileInputRef.current.value = ''; // Reset input
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>
                    <Database size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Backup & Restore Database</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Amankan dan pulihkan data sekolah Anda
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BACKUP SECTION */}
                <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex gap-4 items-start mb-6">
                        <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <Download size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-lg" style={{ color: 'var(--text-primary)' }}>Backup Data</h3>
                            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                                Unduh salinan lengkap dari seluruh data sistem. Lakukan backup secara rutin agar data selalu aman.
                            </p>
                            <button 
                                onClick={handleDownloadBackup}
                                className="w-full flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-1"
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}
                            >
                                <Download size={18} />
                                Download Backup (.sql)
                            </button>
                        </div>
                    </div>
                </div>

                {/* RESTORE SECTION */}
                <div className="p-6 rounded-2xl border relative overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex gap-4 items-start mb-6">
                        <div className="p-3 rounded-lg flex-shrink-0" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-lg" style={{ color: 'var(--text-primary)' }}>Restore Data</h3>
                            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                                Pulihkan database menggunakan file <strong className="text-red-500">.sql</strong>. Peringatan: Tindakan ini akan menimpa seluruh data yang ada saat ini!
                            </p>
                            <input 
                                type="file" 
                                accept=".sql" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleRestoreDatabase} 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-1"
                                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 15px rgba(239,68,68,0.4)' }}
                            >
                                <Upload size={18} />
                                Upload & Restore Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
