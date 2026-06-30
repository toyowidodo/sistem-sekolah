import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import {
    CreditCard, Settings, BarChart2, Search, RefreshCw, Zap,
    CheckCircle, XCircle, ChevronDown, FileText, AlertTriangle
} from 'lucide-react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ModernSelect from '../components/ModernSelect';

const swal = (opts) => Swal.fire({ background: '#0d1526', color: '#e2e8f0', ...opts });

const MONTHS = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const GRADES = ['X', 'XI', 'XII'];
const CY = new Date().getFullYear();
const CURRENT_YEAR = `${CY}/${CY + 1}`;

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

/* â”€ Status Badge â”€ */
const StatusBadge = ({ status }) => {
    const lunas = status === 'lunas';
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
                background: lunas ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                color: lunas ? '#34d399' : '#f87171',
                border: `1px solid ${lunas ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}>
            {lunas ? <CheckCircle size={10} /> : <XCircle size={10} />}
            {lunas ? 'Lunas' : 'Belum Lunas'}
        </span>
    );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TAB 1 â€” TAGIHAN SPP
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function TabTagihan() {
    const [bills, setBills]     = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false);
    const [month, setMonth]     = useState(new Date().getMonth() + 1);
    const [year, setYear]       = useState(CY);
    const [status, setStatus]   = useState('');
    const [search, setSearch]   = useState('');
    const [acYear, setAcYear]   = useState(CURRENT_YEAR);
    const [genLoading, setGenLoading] = useState(false);

    const fetchBills = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ month, year });
            if (status) params.set('status', status);
            if (search) params.set('search', search);
            const r = await api.get(`/spp/bills?${params}`);
            setBills(r.data.data || []);
            setSummary(r.data.summary || {});
        } catch { swal({ title: 'Error', text: 'Gagal memuat tagihan', icon: 'error' }); }
        finally { setLoading(false); }
    }, [month, year, status, search]);

    useEffect(() => { fetchBills(); }, [fetchBills]);

    const handleGenerate = async () => {
        const res = await swal({
            title: `Generate Tagihan`,
            html: `Buat tagihan SPP untuk <b>${MONTHS[month]} ${year}</b>?<br/>
                   <small class="opacity-60">Siswa yang sudah punya tagihan bulan ini akan dilewati.</small>`,
            icon: 'question', showCancelButton: true,
            confirmButtonColor: '#6366f1', cancelButtonColor: '#374151',
            confirmButtonText: 'Ya, Generate!', cancelButtonText: 'Batal',
        });
        if (!res.isConfirmed) return;

        setGenLoading(true);
        try {
            const r = await api.post('/spp/generate', { month, year, academic_year: acYear });
            await fetchBills();
            swal({ title: 'Berhasil!', text: r.data.message, icon: 'success', timer: 2500, showConfirmButton: false });
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal generate', icon: 'error' });
        } finally { setGenLoading(false); }
    };

    const handlePay = async (bill) => {
        const res = await swal({
            title: `Lunaskan SPP`,
            html: `<b>${bill.student_name}</b><br/>${MONTHS[bill.month]} ${bill.year}<br/><b>${fmt(bill.amount)}</b>`,
            input: 'text', inputLabel: 'Diterima oleh',
            inputPlaceholder: 'Nama petugas penerima...',
            showCancelButton: true,
            confirmButtonColor: '#34d399', cancelButtonColor: '#374151',
            confirmButtonText: 'Konfirmasi Lunas', cancelButtonText: 'Batal',
        });
        if (!res.isConfirmed) return;

        try {
            await api.post(`/spp/bills/${bill.id}/pay`, { paid_by: res.value || '' });
            fetchBills();
            swal({ title: 'Lunas!', text: 'Tagihan berhasil dilunasi.', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal', icon: 'error' });
        }
    };

    const handleUnpay = async (bill) => {
        const res = await swal({
            title: 'Batalkan Pelunasan?',
            text: `Status ${bill.student_name} akan kembali ke "Belum Lunas"`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#ef4444', cancelButtonColor: '#374151',
            confirmButtonText: 'Ya, Batalkan', cancelButtonText: 'Batal',
        });
        if (!res.isConfirmed) return;
        try {
            await api.post(`/spp/bills/${bill.id}/unpay`);
            fetchBills();
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal', icon: 'error' });
        }
    };

    const handleExportPDF = () => {
        if (!bills.length) return;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text('LAPORAN SPP', 105, 13, { align: 'center' });
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
        doc.text(`${MONTHS[month]} ${year} â€” Total: ${fmt(summary.totalNominal)} â€” Lunas: ${fmt(summary.lunasNominal)}`, 105, 23, { align: 'center' });

        autoTable(doc, {
            startY: 36,
            head: [['No', 'NISN', 'Nama Siswa', 'Bulan', 'Nominal', 'Status', 'Tanggal Lunas', 'Diterima']],
            body: bills.map((b, i) => [
                i + 1, b.nisn, b.student_name,
                `${MONTHS[b.month]} ${b.year}`,
                fmt(b.amount),
                b.status === 'lunas' ? 'Lunas' : 'Belum Lunas',
                b.paid_at ? new Date(b.paid_at).toLocaleDateString('id-ID') : '-',
                b.paid_by || '-',
            ]),
            headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'center' },
            bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [245, 243, 255] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 8 },
                4: { halign: 'right' }, 5: { halign: 'center' }, 6: { halign: 'center' },
            },
            margin: { left: 10, right: 10 },
        });

        doc.save(`SPP-${MONTHS[month]}-${year}.pdf`);
    };

    const pct = summary.total > 0 ? Math.round((summary.lunas / summary.total) * 100) : 0;

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <ModernSelect value={month} onChange={e => setMonth(Number(e.target.value))} className="input-dark text-sm pr-8 appearance-none w-36">
                        {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                    </ModernSelect>
                </div>
                <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                    className="input-dark text-sm w-24" placeholder="Tahun" />
                <div className="relative">
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <ModernSelect value={status} onChange={e => setStatus(e.target.value)} className="input-dark text-sm pr-8 appearance-none w-32">
                        <option value="">Semua Status</option>
                        <option value="lunas">Lunas</option>
                        <option value="belum">Belum Lunas</option>
                    </ModernSelect>
                </div>
                <div className="relative flex-1 min-w-40">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama / NISN..." className="input-dark text-sm pl-9 w-full" />
                </div>
                <button onClick={fetchBills} className="btn-ghost"><RefreshCw size={13} /> Refresh</button>
                <button onClick={handleExportPDF} disabled={!bills.length} className="btn-ghost" style={{ opacity: bills.length ? 1 : 0.5 }}>
                    <FileText size={13} /> PDF
                </button>
                <button onClick={handleGenerate} disabled={genLoading} className="btn-primary">
                    {genLoading
                        ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        : <Zap size={13} />} Generate Tagihan
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Tagihan', value: summary.total || 0, sub: fmt(summary.totalNominal), color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
                    { label: 'Lunas', value: summary.lunas || 0, sub: fmt(summary.lunasNominal), color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
                    { label: 'Belum Lunas', value: summary.belum || 0, sub: fmt((summary.totalNominal || 0) - (summary.lunasNominal || 0)), color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
                    { label: 'Persentase Lunas', value: `${pct}%`, sub: `${summary.lunas || 0} dari ${summary.total || 0}`, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                ].map((s, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                        <p className="text-xs mb-0.5" style={{ color: 'var(--text-label)' }}>{s.label}</p>
                        <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs mt-0.5 font-mono" style={{ color: s.color, opacity: 0.7 }}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            {summary.total > 0 && (
                <div className="rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                    <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: 'var(--text-muted)' }}>Progress Pelunasan {MONTHS[month]} {year}</span>
                        <span className="font-bold" style={{ color: '#34d399' }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: pct >= 80 ? 'linear-gradient(90deg,#34d399,#10b981)' : pct >= 50 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : 'linear-gradient(90deg,#f87171,#ef4444)' }} />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                            {['#', 'Nama Siswa', 'NISN', 'Bulan', 'Nominal', 'Status', 'Lunas Pada', 'Aksi'].map((h, i) => (
                                <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-th)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="py-12 text-center">
                                <svg className="animate-spin w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="4" />
                                    <path className="opacity-75" fill="#6366f1" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            </td></tr>
                        ) : bills.length === 0 ? (
                            <tr><td colSpan={8} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                <CreditCard size={28} className="mx-auto mb-2 opacity-30" />
                                Tidak ada tagihan. Klik "Generate Tagihan" untuk membuat.
                            </td></tr>
                        ) : bills.map((b, i) => (
                            <tr key={b.id}
                                style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-table-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent'}
                            >
                                <td className="py-2.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                <td className="py-2.5 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{b.student_name}</td>
                                <td className="py-2.5 px-4 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{b.nisn}</td>
                                <td className="py-2.5 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{MONTHS[b.month]} {b.year}</td>
                                <td className="py-2.5 px-4 text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(b.amount)}</td>
                                <td className="py-2.5 px-4"><StatusBadge status={b.status} /></td>
                                <td className="py-2.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {b.paid_at ? new Date(b.paid_at).toLocaleDateString('id-ID') : '-'}
                                    {b.paid_by && <span className="block" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{b.paid_by}</span>}
                                </td>
                                <td className="py-2.5 px-4">
                                    {b.status === 'belum' ? (
                                        <button onClick={() => handlePay(b)}
                                            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150"
                                            style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.22)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}>
                                            âœ“ Lunaskan
                                        </button>
                                    ) : (
                                        <button onClick={() => handleUnpay(b)}
                                            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150"
                                            style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.16)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                                            âœ• Batalkan
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bills.length > 0 && (
                    <div className="px-4 py-2.5 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-footer)' }}>
                        {bills.length} tagihan Â· {MONTHS[month]} {year}
                    </div>
                )}
            </div>
        </div>
    );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TAB 2 â€” PENGATURAN SPP
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function TabSettings() {
    const [settings, setSettings] = useState(
        GRADES.map(g => ({ grade_level: g, amount: '', academic_year: CURRENT_YEAR, notes: '' }))
    );
    const [saving, setSaving] = useState(false);
    const [acYear, setAcYear] = useState(CURRENT_YEAR);

    const fetchSettings = useCallback(async () => {
        try {
            const r = await api.get('/spp/settings');
            const dbSettings = r.data.data || [];
            setSettings(GRADES.map(g => {
                const found = dbSettings.find(s => s.grade_level === g && s.academic_year === acYear);
                return { grade_level: g, amount: found?.amount || '', academic_year: acYear, notes: found?.notes || '' };
            }));
        } catch { }
    }, [acYear]);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/spp/settings', { settings: settings.map(s => ({ ...s, academic_year: acYear })) });
            swal({ title: 'Tersimpan!', text: 'Pengaturan SPP berhasil disimpan.', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal menyimpan', icon: 'error' });
        } finally { setSaving(false); }
    };

    return (
        <div className="space-y-4 max-w-lg">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.04)' }}>
                    <div className="flex items-center gap-2">
                        <Settings size={14} style={{ color: '#818cf8' }} />
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nominal SPP per Tingkat</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tahun Ajaran:</span>
                        <input value={acYear} onChange={e => setAcYear(e.target.value)} className="input-dark text-xs w-24 py-1" />
                    </div>
                </div>
                <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
                        <AlertTriangle size={12} /> Nominal ini akan digunakan saat generate tagihan bulan baru
                    </div>
                    {settings.map((s, i) => (
                        <div key={s.grade_level} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                                style={{
                                    background: i === 0 ? 'rgba(99,102,241,0.15)' : i === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                    color: i === 0 ? '#818cf8' : i === 1 ? '#34d399' : '#fbbf24',
                                }}>
                                {s.grade_level}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Kelas {s.grade_level}</p>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Rp</span>
                                    <input type="number" value={s.amount}
                                        onChange={e => setSettings(prev => prev.map((p, pi) => pi === i ? { ...p, amount: e.target.value } : p))}
                                        className="input-dark pl-8 text-sm w-full" placeholder="0" />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center text-sm mt-2">
                        {saving ? 'Menyimpan...' : <><Settings size={13} /> Simpan Pengaturan</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TAB 3 â€” REKAP TAHUNAN
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function TabRekap() {
    const [data, setData]   = useState([]);
    const [year, setYear]   = useState(CY);
    const [loading, setLoading] = useState(false);

    const fetchRecap = async () => {
        setLoading(true);
        try {
            const r = await api.get(`/spp/recap?year=${year}`);
            setData(r.data.data || []);
        } catch { swal({ title: 'Error', text: 'Gagal memuat rekap', icon: 'error' }); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRecap(); }, [year]);

    const totalLunas = data.reduce((s, d) => s + d.nominal_lunas, 0);
    const totalAll   = data.reduce((s, d) => s + d.nominal_total, 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tahun:</span>
                <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="input-dark text-sm w-24" />
                <button onClick={fetchRecap} className="btn-ghost"><RefreshCw size={13} /> Muat</button>
                <div className="flex-1" />
                <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Terkumpul {year}</p>
                    <p className="text-lg font-black" style={{ color: '#34d399' }}>{fmt(totalLunas)}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>dari {fmt(totalAll)}</p>
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                            {['Bulan', 'Total Siswa', 'Lunas', 'Belum Lunas', 'Terkumpul', 'Progress'].map((h, i) => (
                                <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-th)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="py-10 text-center">
                                <svg className="animate-spin w-6 h-6 mx-auto" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="4" />
                                    <path className="opacity-75" fill="#6366f1" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            </td></tr>
                        ) : data.map((d, i) => (
                            <tr key={d.month}
                                style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-table-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent'}
                            >
                                <td className="py-2.5 px-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{MONTHS[d.month]}</td>
                                <td className="py-2.5 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{d.total}</td>
                                <td className="py-2.5 px-4">
                                    <span className="text-sm font-semibold" style={{ color: '#34d399' }}>{d.lunas}</span>
                                </td>
                                <td className="py-2.5 px-4">
                                    <span className="text-sm font-semibold" style={{ color: d.belum > 0 ? '#f87171' : 'var(--text-muted)' }}>{d.belum}</span>
                                </td>
                                <td className="py-2.5 px-4 text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(d.nominal_lunas)}</td>
                                <td className="py-2.5 px-4">
                                    {d.total > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)', minWidth: 60 }}>
                                                <div className="h-full rounded-full"
                                                    style={{ width: `${d.persen_lunas}%`, background: d.persen_lunas >= 80 ? '#34d399' : d.persen_lunas >= 50 ? '#fbbf24' : '#f87171' }} />
                                            </div>
                                            <span className="text-xs font-semibold" style={{ color: d.persen_lunas >= 80 ? '#34d399' : d.persen_lunas >= 50 ? '#fbbf24' : '#f87171' }}>
                                                {d.persen_lunas}%
                                            </span>
                                        </div>
                                    ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>â€”</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function SPP() {
    const [tab, setTab] = useState('tagihan');

    const tabs = [
        { id: 'tagihan',  label: 'Tagihan SPP',   icon: CreditCard },
        { id: 'settings', label: 'Pengaturan',    icon: Settings },
        { id: 'rekap',    label: 'Rekap Tahunan', icon: BarChart2 },
    ];

    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>
                    <CreditCard size={18} className="text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Manajemen SPP</h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Kelola tagihan, pelunasan, dan rekap SPP bulanan</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl w-fit"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={{
                            background: tab === t.id ? 'linear-gradient(135deg,#10b981,#34d399)' : 'transparent',
                            color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                            boxShadow: tab === t.id ? '0 2px 8px rgba(16,185,129,0.35)' : 'none',
                        }}>
                        <t.icon size={13} /> {t.label}
                    </button>
                ))}
            </div>

            {tab === 'tagihan'  && <TabTagihan />}
            {tab === 'settings' && <TabSettings />}
            {tab === 'rekap'    && <TabRekap />}
        </div>
    );
}
