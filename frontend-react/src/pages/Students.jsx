import { useEffect, useState } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Edit, Trash2, PlusCircle, Download, FileText, Users, Eye, Upload } from 'lucide-react';
import { useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import ModernSelect from '../components/ModernSelect';
import ModernDatepicker from '../components/ModernDatepicker';

const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5";
const labelStyle = { color: 'var(--text-label)' };

export default function Students() {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewData, setViewData] = useState(null);
    const fileInputRef = useRef(null);
    
    const [formTab, setFormTab] = useState('pribadi');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalStudents, setTotalStudents] = useState(0);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchStudents = async () => {
        try {
            const res = await api.get(`/students?page=${currentPage}&per_page=${itemsPerPage}`);
            setStudents(res.data.data);
            setTotalStudents(res.data.meta?.total || res.data.data.length);
        } catch {
            Swal.fire({ title: 'Error', text: 'Gagal memuat data', icon: 'error', background: 'var(--bg-modal)', color: 'var(--text-primary)' });
        }
    };

    useEffect(() => { fetchStudents(); }, [currentPage, itemsPerPage]);

    const openCreateModal = () => {
        reset({ 
            nisn: '', name: '', gender: 'L', religion: '', previous_school: '', 
            birth_place: '', birth_date: '', address: '', phone: '',
            father_name: '', mother_name: '', father_job: '', mother_job: '',
            parent_address_street: '', parent_address_village: '', parent_address_district: '',
            parent_address_city: '', parent_address_province: '',
            guardian_name: '', guardian_job: '', guardian_address: ''
        });
        setEditingId(null);
        setFormTab('pribadi');
        setIsModalOpen(true);
    };

    const openEditModal = (student) => {
        reset(student);
        setEditingId(student.id);
        setFormTab('pribadi');
        setIsModalOpen(true);
    };

    const openViewModal = (student) => {
        setViewData(student);
        setIsViewModalOpen(true);
    };

    const onSubmit = async (data) => {
        try {
            if (editingId) {
                await api.put(`/students/${editingId}`, data);
                Swal.fire({ title: 'Sukses!', text: 'Data siswa diperbarui.', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
            } else {
                await api.post('/students', data);
                Swal.fire({ title: 'Sukses!', text: 'Siswa baru ditambahkan.', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch {
            Swal.fire({ title: 'Error', text: 'Terjadi kesalahan atau NISN sudah ada', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Hapus data siswa?',
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
                await api.delete(`/students/${id}`);
                Swal.fire({ title: 'Terhapus!', text: 'Data siswa telah dihapus.', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
                fetchStudents();
            }
        });
    };

    const handleExportExcel = async () => {
        try {
            const res = await api.get('/students/export/excel', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'data-siswa.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            Swal.fire({ title: 'Error', text: 'Gagal export Excel', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        Swal.fire({
            title: 'Mengunggah...',
            text: 'Harap tunggu, sistem sedang memproses data siswa',
            allowOutsideClick: false,
            background: '#0d1526',
            color: '#e2e8f0',
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            await api.post('/students/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Swal.fire({ title: 'Berhasil!', text: 'Data siswa berhasil diunggah', icon: 'success', background: '#0d1526', color: '#e2e8f0' });
            fetchStudents(); // Refresh data
        } catch (err) {
            Swal.fire({ title: 'Gagal', text: err.response?.data?.message || 'Gagal mengunggah data', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
        
        // Reset file input agar bisa upload file yang sama lagi jika perlu
        e.target.value = null;
    };

    const handleDownloadTemplate = async () => {
        try {
            const res = await api.get('/students/import/template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'template-import-siswa.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            Swal.fire({ title: 'Error', text: 'Gagal mengunduh template', icon: 'error', background: '#0d1526', color: '#e2e8f0' });
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 297, 28, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('LAPORAN DATA SISWA', 148, 12, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 148, 20, { align: 'center' });

        autoTable(doc, {
            startY: 34,
            head: [['No', 'NISN', 'Nama Lengkap', 'L/P', 'Tempat Lahir', 'Tgl Lahir', 'No HP', 'Nama Ayah', 'Nama Ibu']],
            body: students.map((s, i) => [
                i + 1,
                s.nisn || '-',
                s.name || '-',
                s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
                s.birth_place || '-',
                s.birth_date ? new Date(s.birth_date).toLocaleDateString('id-ID') : '-',
                s.phone || '-',
                s.father_name || '-',
                s.mother_name || '-',
            ]),
            headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, halign: 'center' },
            bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            margin: { left: 10, right: 10 },
            styles: { overflow: 'linebreak', cellPadding: 3 },
            didDrawPage: (data) => {
                const pageCount = doc.internal.getNumberOfPages();
                doc.setFontSize(7);
                doc.setTextColor(148, 163, 184);
                doc.text(
                    `Halaman ${data.pageNumber} dari ${pageCount}  •  Total: ${students.length} Siswa`,
                    148, doc.internal.pageSize.height - 5, { align: 'center' }
                );
            },
        });

        doc.save(`Data-Siswa-${new Date().toISOString().slice(0, 10)}.pdf`);
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
        { header: 'NISN', field: 'nisn' },
        { header: 'Nama Lengkap', field: 'name' },
        {
            header: 'L/P', field: 'gender',
            render: (row) => (
                <span style={{
                    display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: '99px',
                    fontSize: '11px', fontWeight: 600,
                    background: row.gender === 'L' ? 'rgba(59,130,246,0.15)' : 'rgba(236,72,153,0.15)',
                    color: row.gender === 'L' ? '#60a5fa' : '#f472b6',
                    border: `1px solid ${row.gender === 'L' ? 'rgba(59,130,246,0.25)' : 'rgba(236,72,153,0.25)'}`,
                }}>
                    {row.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
            )
        },
        { header: 'No HP', field: 'phone' },
        {
            header: 'Aksi', noPrint: true,
            render: (row) => (
                <div className="flex items-center gap-2">
                    {actionBtn('rgba(16,185,129,0.1)', '#34d399', 'rgba(16,185,129,0.2)', 'rgba(16,185,129,0.22)',
                        <Eye size={14} />, () => openViewModal(row), 'Detail')}
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
                <h1 className="text-2xl font-bold uppercase text-gray-900">Laporan Data Siswa</h1>
                <p className="text-sm text-gray-500">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
                <hr className="border-t-2 border-black my-4" />
            </div>

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                        <Users size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Data Siswa</h1>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {students.length} siswa terdaftar
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 no-print flex-wrap">
                    <button onClick={handleExportPDF} className="btn-ghost">
                        <FileText size={15} /> Export PDF
                    </button>
                    <button onClick={handleExportExcel} className="btn-success">
                        <Download size={15} /> Export Excel
                    </button>
                    <input 
                        type="file" 
                        accept=".csv, .xlsx, .xls" 
                        ref={fileInputRef} 
                        onChange={handleImportExcel} 
                        className="hidden" 
                    />
                    <button onClick={() => fileInputRef.current?.click()} className="btn-ghost" style={{ border: '1px solid var(--border)', background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                        <Upload size={15} /> Import CSV/Excel
                    </button>
                    <button onClick={handleDownloadTemplate} className="btn-ghost" style={{ border: '1px solid var(--border)', background: 'var(--bg-input)' }}>
                        Unduh Template
                    </button>
                    <button onClick={openCreateModal} id="btn-tambah-siswa" className="btn-primary">
                        <PlusCircle size={15} /> Tambah Siswa
                    </button>
                </div>
            </div>

                <DataTable 
                    columns={columns} 
                    data={students} 
                    serverSide={true}
                    totalData={totalStudents}
                    page={currentPage}
                    onPageChange={setCurrentPage}
                    perPage={itemsPerPage}
                    onPerPageChange={setItemsPerPage}
                />

            {/* Modal Detail */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detail Identitas Peserta Didik">
                {viewData && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold border-b border-[var(--border)] pb-2 mb-3 text-indigo-400">Data Pribadi</h3>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                <div><span className="block text-gray-500 text-xs">Nama Lengkap</span> <span className="font-semibold text-gray-200">{viewData.name}</span></div>
                                <div><span className="block text-gray-500 text-xs">NISN</span> <span className="font-semibold text-gray-200">{viewData.nisn}</span></div>
                                <div><span className="block text-gray-500 text-xs">Tempat, Tgl Lahir</span> <span className="font-semibold text-gray-200">{viewData.birth_place}, {viewData.birth_date}</span></div>
                                <div><span className="block text-gray-500 text-xs">Jenis Kelamin</span> <span className="font-semibold text-gray-200">{viewData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span></div>
                                <div><span className="block text-gray-500 text-xs">Agama</span> <span className="font-semibold text-gray-200">{viewData.religion || '-'}</span></div>
                                <div><span className="block text-gray-500 text-xs">Pendidikan Sebelumnya</span> <span className="font-semibold text-gray-200">{viewData.previous_school || '-'}</span></div>
                                <div><span className="block text-gray-500 text-xs">No. Handphone</span> <span className="font-semibold text-gray-200">{viewData.phone || '-'}</span></div>
                                <div className="col-span-2"><span className="block text-gray-500 text-xs">Alamat</span> <span className="font-semibold text-gray-200">{viewData.address || '-'}</span></div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold border-b border-[var(--border)] pb-2 mb-3 text-indigo-400">Data Orang Tua</h3>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                <div><span className="block text-gray-500 text-xs">Nama Ayah</span> <span className="font-semibold text-gray-200">{viewData.father_name || '-'}</span></div>
                                <div><span className="block text-gray-500 text-xs">Pekerjaan Ayah</span> <span className="font-semibold text-gray-200">{viewData.father_job || '-'}</span></div>
                                <div><span className="block text-gray-500 text-xs">Nama Ibu</span> <span className="font-semibold text-gray-200">{viewData.mother_name || '-'}</span></div>
                                <div><span className="block text-gray-500 text-xs">Pekerjaan Ibu</span> <span className="font-semibold text-gray-200">{viewData.mother_job || '-'}</span></div>
                                <div className="col-span-2">
                                    <span className="block text-gray-500 text-xs">Alamat Orang Tua</span> 
                                    <span className="font-semibold text-gray-200">
                                        {viewData.parent_address_street ? `${viewData.parent_address_street}, Kel. ${viewData.parent_address_village}, Kec. ${viewData.parent_address_district}, ${viewData.parent_address_city}, ${viewData.parent_address_province}` : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold border-b border-[var(--border)] pb-2 mb-3 text-indigo-400">Data Wali (Opsional)</h3>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                <div><span className="block text-gray-500 text-xs">Nama Wali</span> <span className="font-semibold text-gray-200">{viewData.guardian_name || '-'}</span></div>
                                <div><span className="block text-gray-500 text-xs">Pekerjaan Wali</span> <span className="font-semibold text-gray-200">{viewData.guardian_job || '-'}</span></div>
                                <div className="col-span-2"><span className="block text-gray-500 text-xs">Alamat Wali</span> <span className="font-semibold text-gray-200">{viewData.guardian_address || '-'}</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Form Tambah/Edit */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}>
                <div className="flex gap-2 mb-4 border-b border-[var(--border)] pb-2">
                    <button onClick={() => setFormTab('pribadi')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${formTab === 'pribadi' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>Data Pribadi</button>
                    <button onClick={() => setFormTab('ortu')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${formTab === 'ortu' ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>Data Orang Tua & Wali</button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* SECTION: DATA PRIBADI */}
                    <div className={formTab === 'pribadi' ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className={labelClass} style={labelStyle}>NISN <span className="text-red-400">*</span></label>
                                <input {...register('nisn', { required: true })} className="input-dark w-full" placeholder="Nomor Induk Siswa" />
                            </div>
                            <div>
                                <label className={labelClass} style={labelStyle}>Nama Lengkap <span className="text-red-400">*</span></label>
                                <input {...register('name', { required: true })} className="input-dark w-full" placeholder="Nama siswa" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className={labelClass} style={labelStyle}>Tempat Lahir <span className="text-red-400">*</span></label>
                                <input {...register('pob', { required: true })} className="input-dark w-full" placeholder="Kota lahir" />
                            </div>
                            <div>
                                <label className={labelClass} style={labelStyle}>Tanggal Lahir <span className="text-red-400">*</span></label>
                                <input type="date" {...register('dob', { required: true })} className="input-dark w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className={labelClass} style={labelStyle}>Jenis Kelamin <span className="text-red-400">*</span></label>
                                <ModernSelect {...register('gender')} className="input-dark w-full">
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </ModernSelect>
                            </div>
                            <div>
                                <label className={labelClass} style={labelStyle}>Agama</label>
                                <ModernSelect {...register('religion')} className="input-dark w-full">
                                    <option value="">-- Pilih --</option>
                                    <option value="Islam">Islam</option>
                                    <option value="Kristen">Kristen</option>
                                    <option value="Katolik">Katolik</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Buddha">Buddha</option>
                                    <option value="Konghucu">Konghucu</option>
                                </ModernSelect>
                            </div>
                            <div>
                                <label className={labelClass} style={labelStyle}>Pendidikan Sebelumnya</label>
                                <input {...register('previous_school')} className="input-dark w-full" placeholder="SMP/MTs..." />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className={labelClass} style={labelStyle}>Alamat Peserta Didik <span className="text-red-400">*</span></label>
                            <textarea {...register('address', { required: true })} className="input-dark w-full resize-none" rows="2" placeholder="Alamat lengkap" />
                        </div>
                        <div className="mb-4">
                            <label className={labelClass} style={labelStyle}>Nomor HP <span className="text-red-400">*</span></label>
                            <input {...register('phone', { required: true })} className="input-dark w-full" placeholder="08xx-xxxx-xxxx" />
                        </div>
                        <div className="flex justify-end pt-4 border-t border-[var(--border)]">
                            <button type="button" onClick={() => setFormTab('ortu')} className="btn-primary">Lanjut ke Data Ortu</button>
                        </div>
                    </div>

                    {/* SECTION: DATA ORANG TUA & WALI */}
                    <div className={formTab === 'ortu' ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-input)]">
                                <h4 className="font-bold text-indigo-400 mb-3 text-sm">Data Ayah</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className={labelClass} style={labelStyle}>Nama Ayah</label>
                                        <input {...register('father_name')} className="input-dark w-full" placeholder="Nama ayah" />
                                    </div>
                                    <div>
                                        <label className={labelClass} style={labelStyle}>Pekerjaan Ayah</label>
                                        <input {...register('father_job')} className="input-dark w-full" placeholder="Pekerjaan" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-input)]">
                                <h4 className="font-bold text-pink-400 mb-3 text-sm">Data Ibu</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className={labelClass} style={labelStyle}>Nama Ibu</label>
                                        <input {...register('mother_name')} className="input-dark w-full" placeholder="Nama ibu" />
                                    </div>
                                    <div>
                                        <label className={labelClass} style={labelStyle}>Pekerjaan Ibu</label>
                                        <input {...register('mother_job')} className="input-dark w-full" placeholder="Pekerjaan" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 border border-[var(--border-input)] p-3 rounded-xl">
                            <h4 className="font-bold text-gray-300 mb-3 text-sm">Alamat Orang Tua</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div className="sm:col-span-2">
                                    <label className={labelClass} style={labelStyle}>Jalan</label>
                                    <input {...register('parent_address_street')} className="input-dark w-full" placeholder="Jalan / Perumahan" />
                                </div>
                                <div>
                                    <label className={labelClass} style={labelStyle}>Kelurahan/Desa</label>
                                    <input {...register('parent_address_village')} className="input-dark w-full" placeholder="Kelurahan" />
                                </div>
                                <div>
                                    <label className={labelClass} style={labelStyle}>Kecamatan</label>
                                    <input {...register('parent_address_district')} className="input-dark w-full" placeholder="Kecamatan" />
                                </div>
                                <div>
                                    <label className={labelClass} style={labelStyle}>Kabupaten/Kota</label>
                                    <input {...register('parent_address_city')} className="input-dark w-full" placeholder="Kota" />
                                </div>
                                <div>
                                    <label className={labelClass} style={labelStyle}>Provinsi</label>
                                    <input {...register('parent_address_province')} className="input-dark w-full" placeholder="Provinsi" />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 bg-[var(--bg-input)] border border-[var(--border-input)] p-3 rounded-xl">
                            <h4 className="font-bold text-gray-300 mb-3 text-sm">Wali Peserta Didik (Opsional)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className={labelClass} style={labelStyle}>Nama Wali</label>
                                    <input {...register('guardian_name')} className="input-dark w-full" placeholder="Nama wali" />
                                </div>
                                <div>
                                    <label className={labelClass} style={labelStyle}>Pekerjaan Wali</label>
                                    <input {...register('guardian_job')} className="input-dark w-full" placeholder="Pekerjaan" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClass} style={labelStyle}>Alamat Wali</label>
                                    <textarea {...register('guardian_address')} className="input-dark w-full resize-none" rows="1" placeholder="Alamat wali" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-[var(--border)]">
                            <button type="button" onClick={() => setFormTab('pribadi')} className="btn-ghost">Kembali</button>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Batal</button>
                                <button type="submit" className="btn-primary bg-emerald-600 border-emerald-500 hover:bg-emerald-500">Simpan Data</button>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}