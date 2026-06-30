import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../api/axios';

export default function TabReport() {
    const [summary, setSummary] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await api.get('/student-points/summary');
            setSummary(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredSummary = summary.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.nisn.includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredSummary.length / itemsPerPage);
    const paginatedData = filteredSummary.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="card overflow-hidden border-0">
            <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Rekapitulasi Poin Siswa</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5" size={18} style={{ color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Cari Siswa..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input-dark pl-10"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ background: 'var(--bg-table-head)' }}>
                            <th className="p-4 font-semibold text-sm" style={{ color: 'var(--text-th)', borderBottom: '1px solid var(--border)' }}>NISN</th>
                            <th className="p-4 font-semibold text-sm" style={{ color: 'var(--text-th)', borderBottom: '1px solid var(--border)' }}>Nama Siswa</th>
                            <th className="p-4 font-semibold text-sm text-center" style={{ color: 'var(--text-th)', borderBottom: '1px solid var(--border)' }}>Poin Pelanggaran</th>
                            <th className="p-4 font-semibold text-sm text-center" style={{ color: 'var(--text-th)', borderBottom: '1px solid var(--border)' }}>Poin Prestasi</th>
                            <th className="p-4 font-semibold text-sm text-center" style={{ color: 'var(--text-th)', borderBottom: '1px solid var(--border)' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => {
                            const isDanger = item.total_pelanggaran >= 50; // Contoh batas peringatan
                            const isExcellent = item.total_prestasi >= 50 && item.total_pelanggaran < 20;

                            return (
                                <tr key={item.id} className="transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{item.nisn}</td>
                                    <td className="p-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</td>
                                    <td className="p-4 text-sm text-center font-bold text-red-500">{item.total_pelanggaran}</td>
                                    <td className="p-4 text-sm text-center font-bold text-emerald-500">{item.total_prestasi}</td>
                                    <td className="p-4 text-center">
                                        {isDanger ? (
                                            <span className="badge-danger">Peringatan</span>
                                        ) : isExcellent ? (
                                            <span className="badge-success">Teladan</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-500 border border-gray-500/20">Normal</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                    Tidak ada data siswa.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg btn-ghost disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg btn-ghost disabled:opacity-50"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
