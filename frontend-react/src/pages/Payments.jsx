import { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Edit, Trash2, PlusCircle, FileText, Wallet, CheckCircle, Clock } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import ModernSelect from '../components/ModernSelect';
import ModernDatepicker from '../components/ModernDatepicker';

const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5";
const labelStyle = { color: 'var(--text-label)' };

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchPayments = async () => {
        try {
            const res = await api.get('/payments?per_page=1000');
            setPayments(res.data.data);
        } catch {
            Swal.fire({ title: 'Error', text: 'Gagal memuat data keuangan', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students?per_page=1000');
            setStudents(res.data.data);
        } catch (error) {
            console.error('Gagal memuat siswa', error);
        }
    };

    useEffect(() => { fetchPayments(); fetchStudents(); }, []);

    const openCreateModal = () => {
        reset({ student_id: '', amount: '', status: 'lunas', payment_date: new Date().toISOString().split('T')[0], notes: '' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (payment) => {
        reset({ ...payment, payment_date: payment.payment_date.split('T')[0] });
        setEditingId(payment.id);
        setIsModalOpen(true);
    };

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await api.put(`/payments/${editingId}`, data);
                Swal.fire({ title: 'Sukses!', text: 'Data pembayaran diperbarui.', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
            } else {
                await api.post('/payments', data);
                Swal.fire({ title: 'Sukses!', text: 'Pembayaran berhasil dicatat.', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
            }
            setIsModalOpen(false);
            fetchPayments();
        } catch {
            Swal.fire({ title: 'Error', text: 'Terjadi kesalahan', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Hapus data pembayaran?',
            text: 'Data yang dihapus tidak bisa dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            background: '#0d1526',
            color: '#e2e8f0',
        }).then(async (result) => {
            if (result.isConfirmed) {
                await api.delete(`/payments/${id}`);
                Swal.fire({ title: 'Terhapus!', text: 'Data pembayaran telah dihapus.', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
                fetchPayments();
            }
        });
    };

    // Summary Stats
    const totalLunas  = payments.filter(p => p.status === 'lunas').length;
    const totalBelum  = payments.filter(p => p.status !== 'lunas').length;
    const totalAmount = payments.filter(p => p.status === 'lunas').reduce((acc, p) => acc + Number(p.amount), 0);

    // Export full report PDF
    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 297, 30, 'F');
        doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text('LAPORAN KEUANGAN & SPP', 148, 13, { align: 'center' });
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
        doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 148, 22, { align: 'center' });

        doc.setFontSize(8);
        doc.setTextColor(52, 211, 153);  doc.text(`Total Lunas: ${totalLunas}`, 15, 38);
        doc.setTextColor(248, 113, 113); doc.text(`Belum Lunas: ${totalBelum}`, 75, 38);
        doc.setTextColor(103, 232, 249); doc.text(`Total Pemasukan: Rp ${totalAmount.toLocaleString('id-ID')}`, 135, 38);

        autoTable(doc, {
            startY: 44,
            head: [['No', 'No. Invoice', 'Nama Siswa', 'Jumlah (Rp)', 'Status', 'Tgl Bayar', 'Catatan']],
            body: payments.map((p, i) => [
                i + 1,
                p.invoice_number || '-',
                p.student?.name || '-',
                Number(p.amount).toLocaleString('id-ID'),
                p.status === 'lunas' ? 'Lunas' : 'Belum Lunas',
                p.payment_date ? new Date(p.payment_date).toLocaleDateString('id-ID') : '-',
                p.notes || '-',
            ]),
            headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center' },
            bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [240, 253, 244] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                3: { halign: 'right' },
                4: { halign: 'center' },
                5: { halign: 'center' },
            },
            margin: { left: 10, right: 10 },
            styles: { overflow: 'linebreak', cellPadding: 3 },
            didDrawPage: (data) => {
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(7); doc.setTextColor(148, 163, 184);
                doc.text(`Halaman ${data.pageNumber} dari ${pageCount}  •  Total: ${payments.length} Transaksi`, 148, doc.internal.pageSize.height - 5, { align: 'center' });
            },
        });

        doc.save(`Laporan-Keuangan-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    // Export kwitansi per baris
    const handleExportReceipt = (row) => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
        const W = 148, paid = row.status === 'lunas';

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, W, 22, 'F');
        doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text('KWITANSI PEMBAYARAN SPP', W / 2, 10, { align: 'center' });
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
        doc.text('EduAdmin · Sistem Administrasi Sekolah', W / 2, 17, { align: 'center' });

        doc.setFillColor(paid ? 16 : 239, paid ? 185 : 68, paid ? 129 : 68);
        doc.roundedRect(W - 42, 26, 32, 8, 2, 2, 'F');
        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text(paid ? 'LUNAS' : 'BELUM LUNAS', W - 26, 31.5, { align: 'center' });

        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(99, 102, 241);
        doc.text(`No. ${row.invoice_number || '-'}`, 10, 31.5);

        autoTable(doc, {
            startY: 38,
            body: [
                ['Nama Siswa', row.student?.name || '-'],
                ['NISN', row.student?.nisn || '-'],
                ['Jumlah Pembayaran', `Rp ${Number(row.amount).toLocaleString('id-ID')}`],
                ['Tanggal Bayar', row.payment_date ? new Date(row.payment_date).toLocaleDateString('id-ID') : '-'],
                ['Status', row.status === 'lunas' ? 'Lunas' : 'Belum Lunas'],
                ['Catatan', row.notes || '-'],
            ],
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 } },
            columnStyles: {
                0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 52 },
                1: { textColor: [15, 23, 42] },
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 10, right: 10 },
        });

        const finalY = doc.lastAutoTable.finalY + 14;
        doc.setDrawColor(226, 232, 240);
        doc.line(10, finalY, W - 10, finalY);
        doc.setFontSize(7); doc.setTextColor(148, 163, 184);
        doc.text('Dokumen ini digenerate secara otomatis oleh EduAdmin', W / 2, finalY + 5, { align: 'center' });
        doc.text(new Date().toLocaleString('id-ID'), W / 2, finalY + 10, { align: 'center' });

        doc.save(`Kwitansi-${row.invoice_number || row.id}.pdf`);
    };

    const actionBtn = (bg, color, border, hoverBg, icon, onClick, title) => (
        <button
            onClick={onClick}
            title={title}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ background: bg, color, border: `1px solid ${border}` }}
            onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
            onMouseLeave={e => { e.currentTarget.style.background = bg; }}
        >
            {icon}
        </button>
    );

    const columns = [
        { header: 'No. Invoice', field: 'invoice_number' },
        { header: 'Nama Siswa', render: (row) => row.student?.name || '-' },
        {
            header: 'Jumlah',
            render: (row) => (
                <span className="font-semibold" style={{ color: '#34d399' }}>
                    Rp {Number(row.amount).toLocaleString('id-ID')}
                </span>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                row.status === 'lunas'
                    ? <span className="badge-success"><CheckCircle size={10} /> Lunas</span>
                    : <span className="badge-danger"><Clock size={10} /> Belum Lunas</span>
            )
        },
        {
            header: 'Aksi', noPrint: true,
            render: (row) => (
                <div className="flex items-center gap-2">
                    {actionBtn('rgba(139,92,246,0.1)', '#a78bfa', 'rgba(139,92,246,0.2)', 'rgba(139,92,246,0.22)',
                        <FileText size={14} />, () => handleExportReceipt(row), 'Export Kwitansi PDF')}
                    {actionBtn('rgba(99,102,241,0.1)', '#818cf8', 'rgba(99,102,241,0.2)', 'rgba(99,102,241,0.22)',
                        <Edit size={14} />, () => openEditModal(row), 'Edit')}
                    {actionBtn('rgba(239,68,68,0.1)', '#f87171', 'rgba(239,68,68,0.2)', 'rgba(239,68,68,0.22)',
                        <Trash2 size={14} />, () => handleDelete(row.id), 'Hapus')}
                </div>
            )
        },
    ];

    return (
        <div className="p-6 space-y-5">
            {/* Print Header */}
            <div className="hidden print:block text-center mb-6">
                <h1 className="text-2xl font-bold uppercase text-gray-900">Laporan Keuangan & SPP</h1>
                <p className="text-sm text-gray-500">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
                <hr className="border-t-2 border-black my-4" />
            </div>

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>
                        <Wallet size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Keuangan & SPP</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {payments.length} transaksi tercatat
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 no-print flex-wrap">
                    <button onClick={handleExportPDF} className="btn-ghost">
                        <FileText size={15} /> Export PDF
                    </button>
                    <button onClick={openCreateModal} id="btn-catat-pembayaran" className="btn-primary">
                        <PlusCircle size={15} /> Catat Pembayaran
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
                {[
                    { label: 'Total Lunas',     value: totalLunas,                                 color: '#34d399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)' },
                    { label: 'Belum Lunas',     value: totalBelum,                                 color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.18)'  },
                    { label: 'Total Pemasukan', value: `Rp ${totalAmount.toLocaleString('id-ID')}`, color: '#67e8f9', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.18)'  },
                ].map((item, i) => (
                    <div key={i} className="rounded-xl p-4"
                        style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-label)' }}>{item.label}</p>
                        <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
                    </div>
                ))}
            </div>

            <DataTable columns={columns} data={payments} />

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Pembayaran' : 'Catat Pembayaran Baru'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className={labelClass} style={labelStyle}>Pilih Siswa</label>
                        <ModernSelect {...register('student_id', { required: true })} className="input-dark">
                            <option value="">--- Pilih Siswa ---</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.nisn})</option>
                            ))}
                        </ModernSelect>
                        {errors.student_id && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Jumlah Bayar (Rp)</label>
                            <input type="number" {...register('amount', { required: true })} className="input-dark" placeholder="150000" />
                            {errors.amount && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Status</label>
                            <ModernSelect {...register('status')} className="input-dark">
                                <option value="lunas">Lunas</option>
                                <option value="belum">Belum Lunas</option>
                            </ModernSelect>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Tanggal Pembayaran</label>
                        <ModernDatepicker  {...register('payment_date', { required: true })} className="input-dark" />
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Catatan (Opsional)</label>
                        <textarea {...register('notes')} className="input-dark resize-none" rows="2" placeholder="Pembayaran SPP Bulan Maret" />
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}