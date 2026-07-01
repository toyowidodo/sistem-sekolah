import { useEffect, useState } from 'react';
import api from '../api/axios';
import { getErrorMessage, logError } from '../utils/errorHandler';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Edit, Trash2, PlusCircle, Download, FileText, DollarSign, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRef } from 'react';

const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5";
const labelStyle = { color: 'var(--text-label)' };

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const fileInputRef = useRef(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchPayments = async () => {
        try {
            const res = await api.get('/payments?per_page=1000');
            setPayments(res.data.data);
        } catch (error) {
            logError('Payments:fetchPayments', error);
            Swal.fire({
                title: 'Error',
                text: getErrorMessage(error),
                icon: 'error',
                background: '#0d1526',
                color: '#e2e8f0'
            });
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students?per_page=1000');
            setStudents(res.data.data);
        } catch (error) {
            logError('Payments:fetchStudents', error);
            // Don't show error for students fetch as it's secondary
            console.error('Gagal memuat siswa', error);
        }
    };

    useEffect(() => {
        fetchPayments();
        fetchStudents();
    }, []);

    const openCreateModal = () => {
        reset({ student_id: '', amount: '', payment_type: '', reference: '', notes: '' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (payment) => {
        reset(payment);
        setEditingId(payment.id);
        setIsModalOpen(true);
    };

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await api.put(`/payments/${editingId}`, data);
                Swal.fire({
                    title: 'Sukses!',
                    text: 'Data pembayaran diperbarui.',
                    icon: 'success',
                    background: '#0d1526',
                    color: '#e2e8f0'
                });
            } else {
                await api.post('/payments', data);
                Swal.fire({
                    title: 'Sukses!',
                    text: 'Pembayaran baru ditambahkan.',
                    icon: 'success',
                    background: '#0d1526',
                    color: '#e2e8f0'
                });
            }
            setIsModalOpen(false);
            fetchPayments();
        } catch (error) {
            logError('Payments:onSubmit', error, { editingId });
            Swal.fire({
                title: 'Error',
                text: getErrorMessage(error),
                icon: 'error',
                background: '#0d1526',
                color: '#e2e8f0'
            });
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
                try {
                    await api.delete(`/payments/${id}`);
                    Swal.fire({
                        title: 'Terhapus!',
                        text: 'Data pembayaran telah dihapus.',
                        icon: 'success',
                        background: '#0d1526',
                        color: '#e2e8f0'
                    });
                    fetchPayments();
                } catch (error) {
                    logError('Payments:handleDelete', error, { id });
                    Swal.fire({
                        title: 'Error',
                        text: getErrorMessage(error),
                        icon: 'error',
                        background: '#0d1526',
                        color: '#e2e8f0'
                    });
                }
            }
        });
    };

    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 297, 28, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('LAPORAN DATA PEMBAYARAN', 148, 12, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
            148, 21, { align: 'center' }
        );

        autoTable(doc, {
            startY: 34,
            head: [['No', 'Siswa', 'Jenis Pembayaran', 'Jumlah', 'Tanggal', 'Referensi']],
            body: payments.map((p, i) => [
                i + 1,
                students.find(s => s.id === p.student_id)?.name || '-',
                p.payment_type || '-',
                `Rp ${p.amount?.toLocaleString('id-ID') || '-'}`,
                p.payment_date ? new Date(p.payment_date).toLocaleDateString('id-ID') : '-',
                p.reference || '-',
            ]),
            headStyles: { fillColor: [6, 182, 212], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center' },
            bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            margin: { left: 10, right: 10 },
            styles: { overflow: 'linebreak', cellPadding: 3 },
            didDrawPage: (data) => {
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(7);
                doc.setTextColor(148, 163, 184);
                doc.text(
                    `Halaman ${data.pageNumber} dari ${pageCount}  •  Total: ${payments.length} Pembayaran`,
                    148, doc.internal.pageSize.height - 5, { align: 'center' }
                );
            },
        });

        doc.save(`Data-Pembayaran-${new Date().toISOString().slice(0, 10)}.pdf`);
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
        {
            header: 'Siswa',
            field: 'student_id',
            render: (row) => {
                const student = students.find(s => s.id === row.student_id);
                return student?.name || '-';
            }
        },
        { header: 'Jenis Pembayaran', field: 'payment_type' },
        {
            header: 'Jumlah',
            field: 'amount',
            render: (row) => `Rp ${row.amount?.toLocaleString('id-ID') || '-'}`
        },
        { header: 'Referensi', field: 'reference' },
        {
            header: 'Aksi',
            render: (row) => (
                <div className="flex items-center gap-2">
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #06b6d4, #67e8f9)', boxShadow: '0 4px 12px rgba(6,182,212,0.35)' }}>
                        <DollarSign size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Data Pembayaran</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {payments.length} transaksi terdaftar
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={handleExportPDF} className="btn-ghost" title="Export ke PDF">
                        <FileText size={15} /> Export PDF
                    </button>
                    <button onClick={openCreateModal} className="btn-primary">
                        <PlusCircle size={15} /> Tambah Pembayaran
                    </button>
                </div>
            </div>

            <DataTable columns={columns} data={payments} />

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Pembayaran' : 'Tambah Pembayaran Baru'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className={labelClass} style={labelStyle}>Siswa</label>
                        <select {...register('student_id', { required: true })} className="input-dark w-full">
                            <option value="">Pilih Siswa</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        {errors.student_id && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Jenis Pembayaran</label>
                        <input {...register('payment_type', { required: true })} className="input-dark w-full" placeholder="SPP, Seragam, dll" />
                        {errors.payment_type && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Jumlah</label>
                            <input {...register('amount', { required: true, pattern: /^[0-9]+$/ })} className="input-dark w-full" placeholder="0" />
                            {errors.amount && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi (angka)</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Referensi</label>
                            <input {...register('reference')} className="input-dark w-full" placeholder="No. bukti transfer" />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Catatan</label>
                        <textarea {...register('notes')} className="input-dark w-full resize-none" rows="2" placeholder="Catatan (opsional)" />
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Data</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
