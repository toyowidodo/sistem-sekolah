import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, AlertTriangle } from 'lucide-react';
import ModernSelect from '../../components/ModernSelect';

export default function HomeroomClass() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [classroomId, setClassroomId] = useState('');
    const [message, setMessage] = useState('');

    const load = useCallback(async (id) => {
        setLoading(true);
        try {
            const res = await api.get('/teacher/homeroom-students', {
                params: id ? { classroom_id: id } : {},
            });
            setStudents(res.data.data || []);
            setClassrooms(res.data.classrooms || []);
            setMessage(res.data.message || '');
            if (res.data.classroom_id) setClassroomId(String(res.data.classroom_id));
        } catch (err) {
            setMessage(err.response?.data?.message || 'Gagal memuat data kelas perwalian.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const avgKelas = students.length
        ? (students.reduce((n, s) => n + Number(s.average || 0), 0) / students.length).toFixed(1)
        : '0.0';
    const totalAlpha = students.reduce((n, s) => n + Number(s.alpha || 0), 0);

    return (
        <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#06b6d4,#10b981)', boxShadow: '0 4px 12px rgba(6,182,212,0.35)' }}>
                        <Users size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Kelas Perwalian</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{students.length} siswa</p>
                    </div>
                </div>

                {classrooms.length > 1 && (
                    <ModernSelect
                        value={classroomId}
                        onChange={e => { setClassroomId(e.target.value); load(e.target.value); }}
                        className="input-dark text-sm">
                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </ModernSelect>
                )}
            </div>

            {message && (
                <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
                    {message}
                </div>
            )}

            {!message && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Jumlah Siswa', value: students.length, color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
                        { label: 'Rata-rata Kelas', value: avgKelas, color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
                        { label: 'Total Alpha Bulan Ini', value: totalAlpha, color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
                    ].map((s, i) => (
                        <div key={i} className="rounded-xl p-3" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--text-label)' }}>{s.label}</p>
                            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                                {['NISN', 'Nama Siswa', 'L/P', 'Rata-rata Nilai', 'Alpha Bulan Ini'].map((h, i) => (
                                    <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--text-th)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Memuat...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada siswa di kelas ini</td></tr>
                            ) : students.map((s, i) => (
                                <tr key={s.id}
                                    style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}>
                                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.nisn}</td>
                                    <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm font-bold" style={{ color: s.average >= 75 ? '#34d399' : s.average > 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                                            {s.average > 0 ? s.average : '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {s.alpha > 0 ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                <AlertTriangle size={10} /> {s.alpha}x
                                            </span>
                                        ) : (
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
