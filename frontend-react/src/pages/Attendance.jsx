import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { ClipboardList, Save, ChevronLeft, ChevronRight, BarChart2, CheckCircle, XCircle, AlertCircle, Clock, FileText, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import ModernSelect from '../components/ModernSelect';
import ModernDatepicker from '../components/ModernDatepicker';

const STATUS_CONFIG = {
    hadir: { label: 'Hadir',  color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: CheckCircle },
    sakit: { label: 'Sakit',  color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  icon: AlertCircle },
    izin:  { label: 'Izin',   color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  icon: Clock },
    alpha: { label: 'Alpha',  color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   icon: XCircle },
};

const TODAY = new Date().toISOString().split('T')[0];

export default function Attendance() {
    const [date, setDate]             = useState(TODAY);
    const [rows, setRows]             = useState([]);     // [{student_id, student_name, nisn, status, notes, attendance_id}]
    const [summary, setSummary]       = useState({ hadir: 0, sakit: 0, izin: 0, alpha: 0, total: 0, recorded: 0 });
    const [loading, setLoading]       = useState(false);
    const [saving, setSaving]         = useState(false);
    const [dirty, setDirty]           = useState(false);
    const [tab, setTab]               = useState('input'); // 'input' | 'rekap'
    const [rekapData, setRekapData]   = useState([]);
    const [rekapMonth, setRekapMonth] = useState(new Date().getMonth() + 1);
    const [rekapYear, setRekapYear]   = useState(new Date().getFullYear());

    /* â”€â”€ Fetch attendance for selected date â”€â”€ */
    const fetchAttendance = useCallback(async (d) => {
        setLoading(true);
        try {
            const res = await api.get(`/attendances?date=${d}`);
            const data = res.data.data || [];
            // Default semua siswa ke 'hadir' jika belum ada record
            setRows(data.map(r => ({ ...r, status: r.status ?? 'hadir' })));
            setSummary(res.data.summary || {});
            setDirty(false);
        } catch (err) {
            Swal.fire({ title: 'Error', text: 'Gagal memuat data absensi', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAttendance(date); }, [date, fetchAttendance]);

    /* â”€â”€ Fetch rekap bulanan â”€â”€ */
    const fetchRekap = useCallback(async () => {
        try {
            const res = await api.get(`/attendances/summary?month=${rekapMonth}&year=${rekapYear}`);
            setRekapData(res.data.data || []);
        } catch {
            Swal.fire({ title: 'Error', text: 'Gagal memuat rekap', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
    }, [rekapMonth, rekapYear]);

    useEffect(() => { if (tab === 'rekap') fetchRekap(); }, [tab, fetchRekap]);

    /* â”€â”€ Update status per baris â”€â”€ */
    const handleStatusChange = (index, status) => {
        setRows(prev => prev.map((r, i) => i === index ? { ...r, status } : r));
        setDirty(true);
    };

    const handleNotesChange = (index, notes) => {
        setRows(prev => prev.map((r, i) => i === index ? { ...r, notes } : r));
        setDirty(true);
    };

    /* â”€â”€ Tandai semua hadir â”€â”€ */
    const markAllHadir = () => {
        setRows(prev => prev.map(r => ({ ...r, status: 'hadir' })));
        setDirty(true);
    };

    /* â”€â”€ Simpan absensi â”€â”€ */
    const handleSave = async () => {
        const unset = rows.filter(r => !r.status);
        if (unset.length > 0) {
            Swal.fire({ title: 'Belum lengkap', text: `${unset.length} siswa belum diisi statusnya`, icon: 'warning', background: '#0d1526', color: '#e2e8f0' });
            return;
        }
        setSaving(true);
        try {
            await api.post('/attendances/bulk', {
                date,
                attendances: rows.map(r => ({
                    student_id: r.student_id,
                    status: r.status,
                    notes: r.notes || '',
                })),
            });
            Swal.fire({ title: 'Sukses!', text: 'Absensi berhasil disimpan.', icon: 'success', background: '#0d1526', color: '#e2e8f0', timer: 1800, showConfirmButton: false });
            fetchAttendance(date);
        } catch {
            Swal.fire({ title: 'Error', text: 'Gagal menyimpan absensi', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        } finally {
            setSaving(false);
        }
    };

    /* â”€â”€ Navigasi tanggal â”€â”€ */
    const shiftDate = (days) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        setDate(d.toISOString().split('T')[0]);
    };

    /* â”€â”€ Export PDF Harian â”€â”€ */
    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const tgl = new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text('LAPORAN ABSENSI SISWA', 105, 13, { align: 'center' });
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
        doc.text(tgl, 105, 22, { align: 'center' });

        // Summary
        doc.setFontSize(8);
        doc.setTextColor(52, 211, 153);  doc.text(`Hadir: ${summary.hadir}`, 15, 38);
        doc.setTextColor(96, 165, 250);  doc.text(`Sakit: ${summary.sakit}`, 50, 38);
        doc.setTextColor(251, 191, 36);  doc.text(`Izin: ${summary.izin}`, 85, 38);
        doc.setTextColor(248, 113, 113); doc.text(`Alpha: ${summary.alpha}`, 120, 38);

        autoTable(doc, {
            startY: 44,
            head: [['No', 'NISN', 'Nama Siswa', 'Status', 'Keterangan']],
            body: rows.map((r, i) => [
                i + 1,
                r.nisn || '-',
                r.student_name,
                STATUS_CONFIG[r.status]?.label || r.status || '-',
                r.notes || '-',
            ]),
            headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 28 },
                3: { halign: 'center', cellWidth: 22 },
            },
            margin: { left: 12, right: 12 },
            styles: { cellPadding: 3 },
            didDrawPage: (data) => {
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(7); doc.setTextColor(148, 163, 184);
                doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, 105, doc.internal.pageSize.height - 5, { align: 'center' });
            },
        });

        doc.save(`Absensi-${date}.pdf`);
    };

    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    return (
        <div className="p-6 space-y-5">

            {/* â”€â”€ Page Header â”€â”€ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', boxShadow: '0 4px 12px rgba(139,92,246,0.35)' }}>
                        <ClipboardList size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Absensi Siswa</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Kelola kehadiran siswa harian</p>
                    </div>
                </div>

                {/* Tab Switch */}
                <div className="flex items-center gap-1 p-1 rounded-xl"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                    {[
                        { id: 'input', label: 'Input Harian', icon: ClipboardList },
                        { id: 'rekap', label: 'Rekap Bulanan', icon: BarChart2 },
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                            style={{
                                background: tab === t.id ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)' : 'transparent',
                                color: tab === t.id ? '#fff' : 'var(--text-secondary)',
                                boxShadow: tab === t.id ? '0 2px 8px rgba(139,92,246,0.35)' : 'none',
                            }}>
                            <t.icon size={13} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• TAB: INPUT HARIAN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            {tab === 'input' && (
                <>
                    {/* Date Picker Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => shiftDate(-1)} className="btn-ghost px-3 py-2">
                            <ChevronLeft size={16} />
                        </button>
                        <ModernDatepicker
                            
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="input-dark w-44 text-sm"
                        />
                        <button onClick={() => shiftDate(1)} className="btn-ghost px-3 py-2">
                            <ChevronRight size={16} />
                        </button>
                        <button onClick={() => setDate(TODAY)} className="btn-ghost">
                            Hari Ini
                        </button>

                        <div className="flex-1" />

                        <button onClick={markAllHadir} className="btn-ghost">
                            <CheckCircle size={13} /> Semua Hadir
                        </button>
                        <button onClick={handleExportPDF} className="btn-ghost">
                            <FileText size={13} /> Export PDF
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !dirty}
                            className="btn-primary"
                            style={{ opacity: (!dirty || saving) ? 0.6 : 1 }}
                        >
                            {saving
                                ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Menyimpan...</>
                                : <><Save size={13} /> Simpan Absensi</>
                            }
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <div key={key} className="rounded-xl p-3"
                                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-medium" style={{ color: 'var(--text-label)' }}>{cfg.label}</p>
                                    <cfg.icon size={14} style={{ color: cfg.color }} />
                                </div>
                                <p className="text-2xl font-bold" style={{ color: cfg.color }}>
                                    {summary[key] ?? 0}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    dari {summary.total ?? 0} siswa
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Attendance Table */}
                    <div className="rounded-2xl overflow-hidden"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#8b5cf6" strokeWidth="4"/>
                                    <path className="opacity-75" fill="#8b5cf6" d="M4 12a8 8 0 018-8v8z"/>
                                </svg>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat data...</p>
                            </div>
                        ) : rows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <ClipboardList size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                                <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Tidak ada data siswa</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Pastikan data siswa sudah diinput</p>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                                    style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-th)', background: 'var(--bg-table-head)' }}>
                                    <div className="col-span-1 text-center">#</div>
                                    <div className="col-span-2">NISN</div>
                                    <div className="col-span-3">Nama Siswa</div>
                                    <div className="col-span-4">Status Kehadiran</div>
                                    <div className="col-span-2">Keterangan</div>
                                </div>

                                {/* Table Rows */}
                                <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--border)' }}>
                                    {rows.map((row, i) => {
                                        const cfg = STATUS_CONFIG[row.status];
                                        return (
                                            <div key={row.student_id}
                                                className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center transition-colors duration-150"
                                                style={{ borderBottom: '1px solid var(--border)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-table-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {/* No */}
                                                <div className="col-span-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {i + 1}
                                                </div>
                                                {/* NISN */}
                                                <div className="col-span-2 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                                                    {row.nisn}
                                                </div>
                                                {/* Nama */}
                                                <div className="col-span-3 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {row.student_name}
                                                </div>
                                                {/* Status Buttons */}
                                                <div className="col-span-4 flex items-center gap-1">
                                                    {Object.entries(STATUS_CONFIG).map(([key, sc]) => (
                                                        <button
                                                            key={key}
                                                            onClick={() => handleStatusChange(i, key)}
                                                            className="flex-1 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                                                            style={{
                                                                background: row.status === key ? sc.bg : 'var(--bg-input)',
                                                                color: row.status === key ? sc.color : 'var(--text-muted)',
                                                                border: `1px solid ${row.status === key ? sc.border : 'var(--border-input)'}`,
                                                                transform: row.status === key ? 'scale(1.02)' : 'scale(1)',
                                                            }}
                                                        >
                                                            {sc.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                {/* Notes */}
                                                <div className="col-span-2">
                                                    <input
                                                        type="text"
                                                        value={row.notes || ''}
                                                        onChange={e => handleNotesChange(i, e.target.value)}
                                                        placeholder="Ket..."
                                                        className="w-full px-2 py-1 rounded-lg text-xs transition-all duration-150 outline-none"
                                                        style={{
                                                            background: 'var(--bg-input)',
                                                            border: '1px solid var(--border-input)',
                                                            color: 'var(--text-input)',
                                                        }}
                                                        onFocus={e => {
                                                            e.target.style.borderColor = 'rgba(139,92,246,0.5)';
                                                            e.target.style.boxShadow = '0 0 0 2px rgba(139,92,246,0.1)';
                                                        }}
                                                        onBlur={e => {
                                                            e.target.style.borderColor = 'var(--border-input)';
                                                            e.target.style.boxShadow = 'none';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-3 flex items-center justify-between text-xs"
                                    style={{ borderTop: '1px solid var(--border)', color: 'var(--text-footer)' }}>
                                    <span>{rows.length} siswa</span>
                                    <span className={dirty ? 'text-amber-400' : ''} style={{ color: dirty ? '#fbbf24' : 'var(--text-footer)' }}>
                                        {dirty ? 'â— Ada perubahan yang belum disimpan' : `âœ“ Tersimpan â€” ${summary.recorded} dari ${summary.total} tercatat`}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• TAB: REKAP BULANAN â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
            {tab === 'rekap' && (
                <>
                    {/* Filter Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <ModernSelect value={rekapMonth} onChange={e => setRekapMonth(Number(e.target.value))} className="input-dark w-36 text-sm">
                            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                        </ModernSelect>
                        <input
                            type="number"
                            value={rekapYear}
                            onChange={e => setRekapYear(Number(e.target.value))}
                            min="2020" max="2030"
                            className="input-dark w-24 text-sm"
                        />
                        <button onClick={fetchRekap} className="btn-ghost">
                            <RefreshCw size={13} /> Muat Ulang
                        </button>

                        <div className="flex-1" />

                        {/* Export Rekap PDF */}
                        <button onClick={() => {
                            if (!rekapData.length) return;
                            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                            doc.setFillColor(15, 23, 42);
                            doc.rect(0, 0, 297, 28, 'F');
                            doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
                            doc.text(`REKAP ABSENSI â€” ${months[rekapMonth - 1]} ${rekapYear}`, 148, 13, { align: 'center' });
                            doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
                            doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 148, 21, { align: 'center' });

                            autoTable(doc, {
                                startY: 34,
                                head: [['No', 'NISN', 'Nama Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpha', 'Total Hari']],
                                body: rekapData.map((r, i) => [
                                    i + 1, r.nisn, r.student,
                                    r.hadir, r.sakit, r.izin, r.alpha,
                                    r.hadir + r.sakit + r.izin + r.alpha,
                                ]),
                                headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center' },
                                bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
                                alternateRowStyles: { fillColor: [245, 243, 255] },
                                columnStyles: {
                                    0: { halign: 'center', cellWidth: 10 },
                                    3: { halign: 'center' }, 4: { halign: 'center' },
                                    5: { halign: 'center' }, 6: { halign: 'center' }, 7: { halign: 'center' },
                                },
                                margin: { left: 10, right: 10 },
                                styles: { cellPadding: 3 },
                            });

                            doc.save(`Rekap-Absensi-${months[rekapMonth - 1]}-${rekapYear}.pdf`);
                        }} className="btn-ghost">
                            <FileText size={13} /> Export PDF
                        </button>
                    </div>

                    {/* Rekap Table */}
                    <div className="rounded-2xl overflow-hidden"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>

                        {rekapData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <BarChart2 size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                                <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>Tidak ada rekap</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Belum ada absensi di bulan ini</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                                            {['No', 'NISN', 'Nama Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpha', 'Total'].map((h, i) => (
                                                <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-center"
                                                    style={{ color: 'var(--text-th)' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rekapData.map((row, i) => (
                                            <tr key={i}
                                                style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-table-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent'}
                                            >
                                                <td className="py-2.5 px-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                                <td className="py-2.5 px-4 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{row.nisn}</td>
                                                <td className="py-2.5 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.student}</td>
                                                <td className="py-2.5 px-4 text-sm font-bold text-center" style={{ color: '#34d399' }}>{row.hadir}</td>
                                                <td className="py-2.5 px-4 text-sm font-bold text-center" style={{ color: '#60a5fa' }}>{row.sakit}</td>
                                                <td className="py-2.5 px-4 text-sm font-bold text-center" style={{ color: '#fbbf24' }}>{row.izin}</td>
                                                <td className="py-2.5 px-4 text-sm font-bold text-center" style={{ color: '#f87171' }}>{row.alpha}</td>
                                                <td className="py-2.5 px-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                                                    {row.hadir + row.sakit + row.izin + row.alpha}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="px-4 py-3 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-footer)' }}>
                                    Rekap {months[rekapMonth - 1]} {rekapYear} â€” {rekapData.length} siswa
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
