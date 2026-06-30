import { useEffect, useState } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/DataTable';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

export default function StudentSPP() {
    const [loading, setLoading] = useState(true);
    const [bills, setBills] = useState([]);

    useEffect(() => {
        api.get('/portal/spp').then(res => {
            setBills(res.data.data);
            setLoading(false);
        });
    }, []);

    const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

    const columns = [
        { header: 'Bulan / Tahun', render: row => `${row.month} / ${row.year}` },
        { header: 'Nominal', render: row => fmt(row.amount) },
        { 
            header: 'Status', 
            render: row => row.status === 'lunas' 
                ? <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold flex items-center w-max gap-1"><CheckCircle size={12}/> Lunas</span>
                : <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-bold flex items-center w-max gap-1"><XCircle size={12}/> Belum Lunas</span>
        },
        { header: 'Tanggal Bayar', render: row => row.paid_at ? new Date(row.paid_at).toLocaleDateString('id-ID') : '-' },
    ];

    return (
        <div className="p-6 space-y-6 max-w-4xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <CreditCard size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Tagihan SPP</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Riwayat tagihan dan pembayaran SPP Anda</p>
                </div>
            </div>

            {loading ? (
                <p>Memuat data...</p>
            ) : (
                <DataTable columns={columns} data={bills} />
            )}
        </div>
    );
}
