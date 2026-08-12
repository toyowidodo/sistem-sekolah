import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useChildStore } from '../../store/childStore';
import ChildSelector from './ChildSelector';
import ModernSelect from '../../components/ModernSelect';
import { ClipboardList } from 'lucide-react';

const MONTHS = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const STATUS_CFG = {
    hadir: { label: 'Hadir', color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    sakit: { label: 'Sakit', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    izin:  { label: 'Izin',  color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
    alpha: { label: 'Alpha', color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
};

export default function ParentAttendance() {
    const { selectedId, loaded, fetchChildren } = useChildStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => { fetchChildren(); }, [fetchChildren]);

    useEffect(() => {
        if (!loaded) return;
        setLoading(true);
        setError('');
        api.get('/parent/attendance', {
            params: { month, year, ...(selectedId ? { student_id: selectedId } : {}) },
        })
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat absensi.'))
            .finally(() => setLoading(false));
    }, [selectedId, loaded, month, year]);

    const records = data?.data || [];
    const s = data?.summary;
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>
                        <ClipboardList size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Absensi</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{data?.child?.name}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <ModernSelect value={month} onChange={e => setMonth(Number(e.target.value))} className="input-dark text-sm">
                        {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                    </ModernSelect>
                    <ModernSelect value={year} onChange={e => setYear(Number(e.target.value))} className="input-dark text-sm">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </ModernSelect>
                    <ChildSelector />
                </div>
            </div>

            {error && (
                <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                    {error}
                </div>
            )}

            {s && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                        <div key={key} className="rounded-xl p-3" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--text-label)' }}>{cfg.label}</p>
                            <p className="text-2xl font-bold" style={{ color: cfg.color }}>{s[key]}</p>
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
                                {['Tanggal', 'Status', 'Keterangan'].map((h, i) => (
                                    <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--text-th)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={3} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Memuat...</td></tr>
                            ) : records.length === 0 ? (
                                <tr><td colSpan={3} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                    Belum ada catatan absensi pada {MONTHS[month]} {year}
                                </td></tr>
                            ) : records.map((r, i) => {
                                const cfg = STATUS_CFG[r.status] || STATUS_CFG.alpha;
                                return (
                                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}>
                                        <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                                            {new Date(r.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{r.notes || '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
