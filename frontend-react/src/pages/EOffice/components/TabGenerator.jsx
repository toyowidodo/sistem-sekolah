import { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import { Printer, Users, FileText, ChevronRight, School, Stamp } from 'lucide-react';
import ModernSelect from '../../../components/ModernSelect';

export default function TabGenerator() {
    const [template, setTemplate] = useState('keterangan-aktif');
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [printData, setPrintData] = useState(null);
    const printRef = useRef();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get('/students?per_page=1000');
                setStudents(res.data.data || res.data);
            } catch (err) {}
        };
        fetchStudents();
    }, []);

    const handleGenerate = () => {
        if (!selectedStudentId) {
            alert('Pilih siswa terlebih dahulu!');
            return;
        }
        const student = students.find(s => s.id === parseInt(selectedStudentId));
        if (student) {
            setPrintData({
                type: template,
                date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
                student,
                number: `421.3/${Math.floor(Math.random() * 900) + 100}/SMK.EDU/${new Date().getFullYear()}`
            });
        }
    };

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;

        const printWindow = window.open('', '', 'width=800,height=900');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Cetak Surat</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
                        body { font-family: 'Times New Roman', Times, serif; color: #000; padding: 40px; margin: 0; background: #fff; }
                        .kop { display: flex; align-items: center; border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 2px; }
                        .kop::after { content: ''; display: block; border-bottom: 1px solid #000; margin-top: 2px; padding-top: 2px; width: 100%; position: absolute; left: 0; }
                        .kop-text { flex: 1; text-align: center; }
                        .kop h1 { margin: 0; font-size: 20px; text-transform: uppercase; }
                        .kop h2 { margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                        .kop p { margin: 3px 0 0; font-size: 12px; }
                        
                        .surat-title { text-align: center; margin-top: 35px; margin-bottom: 30px; }
                        .surat-title h3 { margin: 0; font-size: 16px; text-decoration: underline; text-transform: uppercase; }
                        .surat-title p { margin: 5px 0 0; font-size: 14px; }
                        
                        .content { font-size: 12pt; line-height: 1.6; text-align: justify; }
                        .content p { margin: 10px 0; }
                        .table-data { margin: 15px 0 15px 40px; }
                        .table-data td { padding: 3px 10px 3px 0; font-size: 12pt; vertical-align: top; }
                        
                        .ttd { margin-top: 50px; display: flex; justify-content: flex-end; }
                        .ttd-box { width: 250px; text-align: center; font-size: 12pt; }
                        .ttd-space { height: 80px; }
                        .ttd-name { font-weight: bold; text-decoration: underline; }
                        .ttd-nip { margin-top: 2px; }
                        
                        @media print {
                            @page { margin: 2cm; size: A4 portrait; }
                            body { padding: 0; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div style="position: relative;">
                        <div class="kop">
                            <div style="width: 80px; height: 80px; background: #eee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-family: sans-serif;">LOGO</div>
                            <div class="kop-text">
                                <h1>Pemerintah Provinsi Pendidikan</h1>
                                <h2>SMK Bina Edukasi Nusantara</h2>
                                <p>Jl. Pendidikan No. 123, Kota Pelajar, Provinsi Ilmu Pengetahuan 12345</p>
                                <p>Telp: (021) 1234567 | Email: info@smk-edu.id | Website: www.smk-edu.id</p>
                            </div>
                        </div>
                        <div style="border-top: 1px solid #000; margin-top: 2px; margin-bottom: 20px;"></div>
                        ${content.innerHTML}
                    </div>
                    <script>
                        window.onload = () => { window.print(); };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Settings */}
            <div className="col-span-1 space-y-5 rounded-2xl p-5 border" style={{ background:'var(--bg-card)', borderColor:'var(--border-card)' }}>
                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color:'var(--text-primary)' }}>
                    <FileText size={16} className="text-indigo-500"/>
                    Pengaturan Surat
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color:'var(--text-secondary)' }}>Jenis Surat</label>
                        <ModernSelect value={template} onChange={e => setTemplate(e.target.value)} className="input-dark w-full">
                            <option value="keterangan-aktif">Surat Keterangan Aktif Siswa</option>
                            <option value="panggilan-ortu">Surat Panggilan Orang Tua</option>
                        </ModernSelect>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color:'var(--text-secondary)' }}>Pilih Siswa</label>
                        <div className="relative">
                            <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                            <ModernSelect value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className="input-dark w-full pl-9">
                                <option value="">--- Cari / Pilih Siswa ---</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.nis} - {s.name}</option>
                                ))}
                            </ModernSelect>
                        </div>
                    </div>

                    <button onClick={handleGenerate} className="btn-primary w-full justify-center mt-2">
                        Buat Pratinjau Surat <ChevronRight size={14}/>
                    </button>
                </div>
            </div>

            {/* Print Preview Area */}
            <div className="col-span-1 md:col-span-2">
                {!printData ? (
                    <div className="h-96 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center p-6"
                        style={{ borderColor:'var(--border)', background:'rgba(0,0,0,0.1)' }}>
                        <Stamp size={48} className="text-gray-500 mb-3 opacity-50"/>
                        <p className="text-sm font-bold" style={{ color:'var(--text-primary)' }}>Belum ada Pratinjau</p>
                        <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>Pilih jenis surat dan siswa, lalu klik Buat Pratinjau.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={handlePrint} className="btn-primary" style={{ background:'linear-gradient(135deg, #10b981, #059669)' }}>
                                <Printer size={14}/> Cetak / Simpan PDF
                            </button>
                        </div>

                        {/* Visual Preview Container */}
                        <div className="bg-white text-black p-8 rounded-xl shadow-xl mx-auto overflow-hidden relative" style={{ minHeight: '800px', maxWidth: '100%' }}>
                            {/* Hidden element to store the raw HTML for printing */}
                            <div className="hidden">
                                <div ref={printRef}>
                                    <div className="surat-title">
                                        <h3>
                                            {printData.type === 'keterangan-aktif' ? 'Surat Keterangan Aktif Belajar' : 'Surat Panggilan Orang Tua'}
                                        </h3>
                                        <p>Nomor: {printData.number}</p>
                                    </div>
                                    <div className="content">
                                        {printData.type === 'keterangan-aktif' ? (
                                            <>
                                                <p>Yang bertanda tangan di bawah ini, Kepala SMK Bina Edukasi Nusantara, menerangkan dengan sesungguhnya bahwa:</p>
                                                <table className="table-data">
                                                    <tbody>
                                                        <tr><td>Nama</td><td>:</td><td><strong>{printData.student.name}</strong></td></tr>
                                                        <tr><td>NIS / NISN</td><td>:</td><td>{printData.student.nis} / {printData.student.nisn || '-'}</td></tr>
                                                        <tr><td>Kelas</td><td>:</td><td>{printData.student.classroom?.name || '-'}</td></tr>
                                                        <tr><td>Alamat</td><td>:</td><td>{printData.student.address || '-'}</td></tr>
                                                    </tbody>
                                                </table>
                                                <p>Adalah benar siswa tersebut di atas terdaftar dan masih aktif belajar di SMK Bina Edukasi Nusantara pada Tahun Ajaran {new Date().getFullYear()}/{new Date().getFullYear()+1}.</p>
                                                <p>Demikian surat keterangan ini dibuat dengan sesungguhnya untuk dapat dipergunakan sebagaimana mestinya.</p>
                                            </>
                                        ) : (
                                            <>
                                                <p>Kepada Yth.<br/>Bapak/Ibu Orang Tua/Wali dari Siswa:<br/><strong>{printData.student.name}</strong> (Kelas {printData.student.classroom?.name || '-'})<br/>di Tempat</p>
                                                <p>Dengan hormat,</p>
                                                <p>Sehubungan dengan adanya hal penting yang perlu dibicarakan mengenai perkembangan akademik dan kedisiplinan putra/putri Bapak/Ibu, maka kami mengundang Bapak/Ibu untuk hadir di sekolah pada:</p>
                                                <table className="table-data">
                                                    <tbody>
                                                        <tr><td>Hari / Tanggal</td><td>:</td><td>.........................................................</td></tr>
                                                        <tr><td>Waktu</td><td>:</td><td>08.00 WIB s.d Selesai</td></tr>
                                                        <tr><td>Tempat</td><td>:</td><td>Ruang Bimbingan Konseling (BK)</td></tr>
                                                        <tr><td>Keperluan</td><td>:</td><td>Konsultasi Perkembangan Siswa</td></tr>
                                                    </tbody>
                                                </table>
                                                <p>Mengingat pentingnya acara tersebut, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktunya.</p>
                                                <p>Demikian surat undangan ini kami sampaikan. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="ttd">
                                        <div className="ttd-box">
                                            <p>Kota Pelajar, {printData.date}</p>
                                            <p>Kepala Sekolah,</p>
                                            <div className="ttd-space"></div>
                                            <p className="ttd-name">Drs. H. Achmad Pendidikan, M.Pd.</p>
                                            <p className="ttd-nip">NIP. 19700101 199512 1 001</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scale down view for React UI only */}
                            <div className="opacity-50 pointer-events-none select-none flex flex-col items-center justify-center h-full absolute inset-0">
                                <FileText size={100} className="text-gray-300"/>
                                <p className="mt-4 font-bold text-gray-400">Dokumen Siap Cetak</p>
                                <p className="text-sm text-gray-400">Klik tombol "Cetak" di atas untuk melihat pratinjau asli</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
