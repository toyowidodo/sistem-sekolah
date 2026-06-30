import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Edit, Trash2, PlusCircle, GraduationCap, Download, FileText, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5";
const labelStyle = { color: 'var(--text-label)' };

export default function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const fileInputRef = useRef(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers?per_page=1000');
            setTeachers(res.data.data);
        } catch {
            Swal.fire({ title: 'Error', text: 'Gagal memuat data guru', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
    };

    useEffect(() => { fetchTeachers(); }, []);

    const openCreateModal = () => {
        reset({ nip: '', name: '', position: '', subject: '', education: '', phone: '' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (teacher) => {
        reset(teacher);
        setEditingId(teacher.id);
        setIsModalOpen(true);
    };

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await api.put(`/teachers/${editingId}`, data);
                Swal.fire({ title: 'Sukses!', text: 'Data guru diperbarui.', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
            } else {
                await api.post('/teachers', data);
                Swal.fire({ title: 'Sukses!', text: 'Guru baru ditambahkan.', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
            }
            setIsModalOpen(false);
            fetchTeachers();
        } catch {
            Swal.fire({ title: 'Error', text: 'Terjadi kesalahan', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Hapus data guru?',
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
                await api.delete(`/teachers/${id}`);
                Swal.fire({ title: 'Terhapus!', text: 'Data guru telah dihapus.', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
                fetchTeachers();
            }
        });
    };

    // ── Export Excel ──
    const handleExportExcel = async () => {
        try {
            const res = await api.get('/teachers/export/excel', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'data-guru.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            Swal.fire({ title: 'Error', text: 'Gagal export Excel', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
    };

    // ── Export PDF ──
    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 297, 28, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('LAPORAN DATA GURU & STAFF', 148, 12, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
            148, 21, { align: 'center' }
        );

        autoTable(doc, {
            startY: 34,
            head: [['No', 'NIP', 'Nama Guru', 'Jabatan', 'Mata Pelajaran', 'Pendidikan', 'No HP']],
            body: teachers.map((t, i) => [
                i + 1,
                t.nip || '-',
                t.name || '-',
                t.position || '-',
                t.subject || '-',
                t.education || '-',
                t.phone || '-',
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
                    `Halaman ${data.pageNumber} dari ${pageCount}  •  Total: ${teachers.length} Guru`,
                    148, doc.internal.pageSize.height - 5, { align: 'center' }
                );
            },
        });

        doc.save(`Data-Guru-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    // ── Import Excel ──
    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        Swal.fire({
            title: 'Mengunggah...',
            text: 'Harap tunggu, sistem sedang memproses data guru',
            allowOutsideClick: false,
            background: '#0d1526',
            color: '#e2e8f0',
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            await api.post('/teachers/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Swal.fire({ title: 'Berhasil!', text: 'Data guru berhasil diunggah', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
            fetchTeachers();
        } catch (err) {
            Swal.fire({ title: 'Gagal', text: err.response?.data?.message || 'Gagal mengunggah data', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }

        e.target.value = null;
    };

    // ── Download Template ──
    const handleDownloadTemplate = async () => {
        try {
            const res = await api.get('/teachers/import/template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'template-import-guru.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            Swal.fire({ title: 'Error', text: 'Gagal mengunduh template', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
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
        { header: 'NIP', field: 'nip' },
        { header: 'Nama Guru', field: 'name' },
        {
            header: 'Jabatan', field: 'position',
            render: (row) => (
                <span style={{
                    display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '99px',
                    fontSize: '11px', fontWeight: 500,
                    background: 'rgba(6,182,212,0.12)', color: '#67e8f9',
                    border: '1px solid rgba(6,182,212,0.2)',
                }}>
                    {row.position}
                </span>
            )
        },
        { header: 'Mata Pelajaran', field: 'subject' },
        { header: 'No HP', field: 'phone' },
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
                        <GraduationCap size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Data Guru & Staff</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {teachers.length} guru terdaftar
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={handleExportPDF} className="btn-ghost" title="Export ke PDF">
                        <FileText size={15} /> Export PDF
                    </button>
                    <button onClick={handleExportExcel} className="btn-success" title="Export ke Excel">
                        <Download size={15} /> Export Excel
                    </button>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        ref={fileInputRef}
                        onChange={handleImportExcel}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-ghost"
                        title="Import dari CSV/Excel"
                        style={{ border: '1px solid var(--border)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                    >
                        <Upload size={15} /> Import CSV/Excel
                    </button>
                    <button
                        onClick={handleDownloadTemplate}
                        className="btn-ghost"
                        title="Unduh template import"
                        style={{ border: '1px solid var(--border)', background: 'var(--bg-input)' }}
                    >
                        Unduh Template
                    </button>
                    <button onClick={openCreateModal} id="btn-tambah-guru" className="btn-primary">
                        <PlusCircle size={15} /> Tambah Guru
                    </button>
                </div>
            </div>

            <DataTable columns={columns} data={teachers} />

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Data Guru' : 'Tambah Guru Baru'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>NIP</label>
                            <input {...register('nip', { required: true })} className="input-dark" placeholder="Nomor Induk Pegawai" />
                            {errors.nip && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Nama Lengkap</label>
                            <input {...register('name', { required: true })} className="input-dark" placeholder="Nama guru" />
                            {errors.name && <span className="text-xs mt-1 block" style={{ color: '#f87171' }}>Wajib diisi</span>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Jabatan</label>
                            <input {...register('position', { required: true })} className="input-dark" placeholder="Guru Matematika" />
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Mata Pelajaran</label>
                            <input {...register('subject', { required: true })} className="input-dark" placeholder="Matematika" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Pendidikan Terakhir</label>
                            <input {...register('education', { required: true })} className="input-dark" placeholder="S1 Pendidikan" />
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>No HP</label>
                            <input {...register('phone', { required: true })} className="input-dark" placeholder="08xx-xxxx-xxxx" />
                        </div>
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