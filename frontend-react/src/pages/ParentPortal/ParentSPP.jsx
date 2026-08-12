import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useChildStore } from '../../store/childStore';
import ChildSelector from './ChildSelector';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const MONTHS = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function ParentSPP() {
    const { selectedId, loaded, fetchChildren } = useChildStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchChildren(); }, [fetchChildren]);

    useEffect(() => {
        if (!loaded) return;
        setLoading(true);
        setError('');
        api.get('/parent/spp', { params: selectedId ? { student_id: selectedId } : {} })
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.message || 'Gagal memuat tagihan.'))
            .finally(() => setLoading(false));
    }, [selectedId, loaded]);

    const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
    const bills = data?.data || [];
    const s = data?.summary;

    return (
        <div className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#f43f5e,#fb7185)', boxShadow: '0 4px 12px rgba(244,63,94,0.35)' }}>
                        <CreditCard size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Tagihan SPP</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{data?.child?.name}</p>
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

            {s && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Total Tagihan', value: fmt(s.total), color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
                        { label: 'Sudah Lunas', value: fmt(s.lunas), color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
                        { label: 'Belum Lunas', value: fmt(s.belum), color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
                    ].map((c, i) => (
                        <div key={i} className="rounded-xl p-4" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--text-label)' }}>{c.label}</p>
                            <p className="text-xl font-bold" style={{ color: c.color }}>{c.value}</p>
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
                                {['Bulan', 'Tahun Ajaran', 'Nominal', 'Status', 'Tanggal Bayar'].map((h, i) => (
                                    <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--text-th)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Memuat...</td></tr>
                            ) : bills.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada tagihan</td></tr>
                            ) : bills.map((b, i) => (
                                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}>
                                    <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                        {MONTHS[b.month]} {b.year}
                                    </td>
                                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{b.academic_year}</td>
                                    <td className="py-3 px-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(b.amount)}</td>
                                    <td className="py-3 px-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                            style={b.status === 'lunas'
                                                ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }
                                                : { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                            {b.status === 'lunas' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                            {b.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {b.paid_at ? new Date(b.paid_at).toLocaleDateString('id-ID') : '-'}
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
