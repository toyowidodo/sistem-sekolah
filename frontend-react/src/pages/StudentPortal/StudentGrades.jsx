import { useEffect, useState } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import { Award } from 'lucide-react';

export default function StudentGrades() {
    const [loading, setLoading] = useState(true);
    const [grades, setGrades] = useState([]);

    useEffect(() => {
        api.get('/portal/grades').then(res => {
            setGrades(res.data.data);
            setLoading(false);
        });
    }, []);

    const columns = [
        { header: 'Tahun Ajaran', field: 'academic_year' },
        { header: 'Semester', field: 'semester' },
        { header: 'Mata Pelajaran', render: row => row.subject?.name },
        { header: 'Kelas', render: row => row.classroom?.name || '-' },
        { 
            header: 'Nilai', 
            render: row => <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded text-sm font-bold">{row.score}</span>
        },
    ];

    return (
        <div className="p-6 space-y-6 max-w-5xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Award size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Rapor & Nilai</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Riwayat nilai akademik Anda</p>
                </div>
            </div>

            {loading ? (
                <p>Memuat data...</p>
            ) : (
                <DataTable columns={columns} data={grades} />
            )}
        </div>
    );
}
