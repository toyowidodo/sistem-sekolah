import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useChildStore } from '../../store/childStore';
import ChildSelector from './ChildSelector';
import { Award } from 'lucide-react';

export default function ParentGrades() {
    const { selectedId, loaded, fetchChildren } = useChildStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchChildren(); }, [fetchChildren]);

    useEffect(() => {
        if (!loaded) return;
        setLoading(true);
        setError('');
        api.get('/parent/grades', { params: selectedId ? { student_id: selectedId } : {} })
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat nilai.'))
            .finally(() => setLoading(false));
    }, [selectedId, loaded]);

    const grades = data?.data || [];

    return (
        <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                        <Award size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nilai & Rapor</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {data?.child?.name}
                            {data?.average != null && <> &middot; Rata-rata keseluruhan {data.average}</>}
                        </p>
                    </div>
                </div>
                <ChildSelector />
            </div>

            {error && (
                <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                    {error}
                </div>
            )}

            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                                {['Mata Pelajaran', 'Kelas', 'Periode', 'Tugas', 'UTS', 'UAS', 'Akhir', 'Predikat'].map((h, i) => (
                                    <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--text-th)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Memuat...</td></tr>
                            ) : grades.length === 0 ? (
                                <tr><td colSpan={8} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada nilai yang diinput</td></tr>
                            ) : grades.map((g, i) => (
                                <tr key={g.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}>
                                    <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g.subject?.name}</td>
                                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{g.classroom?.name || '-'}</td>
                                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{g.academic_year} / Sem {g.semester}</td>
                                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{g.score_tugas ?? '-'}</td>
                                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{g.score_uts ?? '-'}</td>
                                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{g.score_uas ?? '-'}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 rounded text-xs font-bold"
                                            style={{
                                                background: g.final_score >= 75 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                                                color: g.final_score >= 75 ? '#34d399' : '#fbbf24',
                                            }}>
                                            {g.final_score ?? '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{g.grade_letter || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
