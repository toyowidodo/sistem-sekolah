import { useEffect, useState } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import { CalendarDays } from 'lucide-react';

export default function StudentSchedules() {
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        api.get('/portal/schedules').then(res => {
            setSchedules(res.data.data);
            setLoading(false);
        });
    }, []);

    const columns = [
        { header: 'Hari', field: 'day_of_week' },
        { header: 'Jam Mulai', field: 'start_time' },
        { header: 'Jam Selesai', field: 'end_time' },
        { header: 'Mata Pelajaran', render: row => row.subject?.name },
        { header: 'Guru', render: row => row.teacher?.name },
        { header: 'Kelas', render: row => row.classroom?.name || '-' },
    ];

    return (
        <div className="p-6 space-y-6 max-w-5xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <CalendarDays size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Jadwal Pelajaran</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Seluruh jadwal kelas</p>
                </div>
            </div>

            {loading ? (
                <p>Memuat data...</p>
            ) : (
                <DataTable columns={columns} data={schedules} />
            )}
        </div>
    );
}
