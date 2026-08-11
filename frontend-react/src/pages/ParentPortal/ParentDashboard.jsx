import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useChildStore } from '../../store/childStore';
import ChildSelector from './ChildSelector';
import { Activity, CreditCard, CalendarDays, Award, ShieldAlert, Trophy } from 'lucide-react';

export default function ParentDashboard() {
    const { selectedId, loaded, fetchChildren } = useChildStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchChildren(); }, [fetchChildren]);

    useEffect(() => {
        if (!loaded) return;

        setLoading(true);
        setError('');
        api.get('/parent/dashboard', { params: selectedId ? { student_id: selectedId } : {} })
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat data.'))
            .finally(() => setLoading(false));
    }, [selectedId, loaded]);

    const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6">
                <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error || 'Gagal memuat data.'}</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Kehadiran Bulan Ini', value: `${data.attendance_percentage}%`,
            sub: `${data.attendance_recorded} hari tercatat`,
            icon: Activity, gradient: 'linear-gradient(135deg, #10b981, #34d399)'
        },
        {
            title: 'Absensi Hari Ini',
            value: data.attendance_today === 'Belum Ada' ? 'Belum Ada'
                : data.attendance_today.charAt(0).toUpperCase() + data.attendance_today.slice(1),
            icon: CalendarDays, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)'
        },
        {
            title: 'Tunggakan SPP', value: fmt(data.unpaid_bills),
            sub: data.unpaid_count > 0 ? `${data.unpaid_count} tagihan belum lunas` : 'Tidak ada tunggakan',
            icon: CreditCard, gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)'
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {data.child.name}
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        NISN {data.child.nisn}
                        {data.child.classroom_name && <> &middot; {data.child.classroom_name}</>}
                    </p>
                </div>
                <ChildSelector />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {stats.map((stat, i) => (
                    <div key={i} className="rounded-2xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>{stat.title}</p>
                                <h3 className="text-2xl font-black mt-2 tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>{stat.value}</h3>
                                {stat.sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.sub}</p>}
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: stat.gradient }}>
                                <stat.icon size={22} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Nilai terbaru */}
                <div className="lg:col-span-2 rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                        <Award size={20} className="text-indigo-500" /> Nilai Terbaru
                    </h2>
                    {data.latest_grades.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada nilai yang diinput.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['Mata Pelajaran', 'Periode', 'Nilai', 'Predikat'].map((h, i) => (
                                            <th key={i} className="py-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.latest_grades.map((g, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td className="py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g.subject}</td>
                                            <td className="py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                {g.academic_year} / Sem {g.semester}
                                            </td>
                                            <td className="py-3">
                                                <span className="px-2 py-1 rounded text-xs font-bold"
                                                    style={{
                                                        background: g.final_score >= 75 ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                                                        color: g.final_score >= 75 ? '#34d399' : '#fbbf24',
                                                    }}>
                                                    {g.final_score ?? '-'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                                {g.grade_letter || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Kedisiplinan */}
                <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
                    <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Catatan Sikap</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <Trophy size={18} style={{ color: '#34d399' }} />
                            <div>
                                <p className="text-xs" style={{ color: 'var(--text-label)' }}>Poin Prestasi</p>
                                <p className="text-xl font-bold" style={{ color: '#34d399' }}>{data.points.prestasi}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <ShieldAlert size={18} style={{ color: '#f87171' }} />
                            <div>
                                <p className="text-xs" style={{ color: 'var(--text-label)' }}>Poin Pelanggaran</p>
                                <p className="text-xl font-bold" style={{ color: '#f87171' }}>{data.points.pelanggaran}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
