import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { CalendarDays, BookOpen, Users, ClipboardCheck, Clock, MapPin } from 'lucide-react';

export default function TeacherDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/teacher/dashboard')
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat portal guru.'))
            .finally(() => setLoading(false));
    }, []);

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

    const att = data.attendance_today;
    const stats = [
        {
            title: 'Mengajar Hari Ini', value: `${data.today_schedules.length} jam`,
            icon: CalendarDays, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)'
        },
        {
            title: 'Total Beban Mengajar', value: `${data.teaching_load} jam`,
            icon: BookOpen, gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
        },
        {
            title: 'Kelas Perwalian', value: data.homeroom_classes.length > 0
                ? data.homeroom_classes.map(c => c.name).join(', ') : '-',
            icon: Users, gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)'
        },
        {
            title: 'Absensi Perwalian', value: att ? `${att.recorded}/${att.total}` : '-',
            icon: ClipboardCheck, gradient: 'linear-gradient(135deg, #10b981, #34d399)'
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    Selamat Datang, {data.teacher.name}
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {data.teacher.position} &middot; NIP {data.teacher.nip} &middot; {data.today}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
                    <div key={i} className="rounded-2xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>{stat.title}</p>
                                <h3 className="text-2xl font-black mt-2 tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>{stat.value}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: stat.gradient }}>
                                <stat.icon size={22} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                    <CalendarDays size={20} className="text-indigo-500" /> Jadwal Mengajar Hari Ini
                </h2>

                {data.today_schedules.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Tidak ada jadwal mengajar hari {data.today}.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {data.today_schedules.map(s => (
                            <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl"
                                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                                <div className="flex items-center gap-1.5 text-sm font-bold flex-shrink-0" style={{ color: '#818cf8' }}>
                                    <Clock size={14} />
                                    {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                        {s.subject?.name}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                        {s.classroom?.name}
                                        {s.room && <> &middot; <MapPin size={10} className="inline" /> {s.room}</>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {att && (
                <div className="rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}>
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                        <ClipboardCheck size={20} className="text-emerald-500" /> Kehadiran Kelas Perwalian Hari Ini
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Hadir', value: att.hadir, color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
                            { label: 'Sakit', value: att.sakit, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                            { label: 'Izin', value: att.izin, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
                            { label: 'Alpha', value: att.alpha, color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
                        ].map((s, i) => (
                            <div key={i} className="rounded-xl p-3" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                                <p className="text-xs mb-1" style={{ color: 'var(--text-label)' }}>{s.label}</p>
                                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                    {att.recorded < att.total && (
                        <p className="text-xs mt-3" style={{ color: '#fbbf24' }}>
                            {att.total - att.recorded} siswa belum diabsen hari ini.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
