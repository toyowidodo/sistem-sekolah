import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

export default function TeacherSchedules() {
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/teacher/schedules')
            .then(res => setDays(res.data.data || []))
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat jadwal.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const totalJam = days.reduce((n, d) => n + d.schedules.length, 0);

    return (
        <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                    <CalendarDays size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Jadwal Mengajar Saya</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{totalJam} jam pelajaran per minggu</p>
                </div>
            </div>

            {error && (
                <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {days.map(d => (
                    <div key={d.day} className="rounded-2xl overflow-hidden"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                        <div className="px-4 py-3 flex items-center justify-between"
                            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{d.day}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                                {d.schedules.length} jam
                            </span>
                        </div>

                        <div className="p-3 space-y-2">
                            {d.schedules.length === 0 ? (
                                <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>Tidak ada jadwal</p>
                            ) : d.schedules.map(s => (
                                <div key={s.id} className="p-3 rounded-xl"
                                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                                    <div className="flex items-center gap-1.5 text-xs font-bold mb-1" style={{ color: '#818cf8' }}>
                                        <Clock size={11} />
                                        {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}
                                    </div>
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                        {s.subject?.name}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                        {s.classroom?.name}
                                        {s.room && <> &middot; <MapPin size={10} className="inline" /> {s.room}</>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
