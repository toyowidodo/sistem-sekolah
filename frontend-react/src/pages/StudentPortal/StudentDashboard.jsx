import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Award, CreditCard, Activity, CalendarDays } from 'lucide-react';

export default function StudentDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/portal/dashboard');
                setData(res.data);
            } catch (error) {
                console.error("Gagal memuat portal siswa", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return <div className="p-6">Gagal memuat data.</div>;

    const stats = [
        { title: 'Persentase Kehadiran', value: `${data.attendance_percentage}%`, icon: Activity, gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
        { title: 'Absensi Hari Ini', value: data.attendance_today === 'hadir' ? 'Hadir' : (data.attendance_today === 'Belum Ada' ? 'Belum Ada' : 'Absen'), icon: CalendarDays, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
        { title: 'Tunggakan SPP', value: fmt(data.unpaid_bills), icon: CreditCard, gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)' },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Selamat Datang, {data.student.name}</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    NISN: {data.student.nisn} | Portal Informasi Siswa
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {stats.map((stat, i) => (
                    <div key={i} className="rounded-2xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>{stat.title}</p>
                                <h3 className="text-2xl font-black mt-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>{stat.value}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: stat.gradient }}>
                                <stat.icon size={22} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
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
                                    <th className="py-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Mata Pelajaran</th>
                                    <th className="py-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Semester</th>
                                    <th className="py-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Nilai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.latest_grades.map((grade, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td className="py-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{grade.subject?.name}</td>
                                        <td className="py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{grade.academic_year} / Sem {grade.semester}</td>
                                        <td className="py-3">
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-500/10 text-indigo-500">{grade.score}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
