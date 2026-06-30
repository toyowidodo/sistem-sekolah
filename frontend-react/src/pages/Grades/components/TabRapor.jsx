import { useEffect, useState, useCallback } from 'react';
import api from '../../../api/axios';
import { Award, BookOpen, Save, FileText, ChevronDown, RefreshCw, TrendingUp, Star, Medal } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { swal, GRADE_CFG, GradeBadge, ScoreInput, CURRENT_YEAR } from './Shared';
import ModernSelect from '../../../components/ModernSelect';

export default function TabRapor() {
    const [students, setStudents] = useState([]);
    const [studentId, setStudentId] = useState('');
    const [semester, setSemester]   = useState(1);
    const [academicYear, setAcYear] = useState(CURRENT_YEAR);
    const [report, setReport]       = useState(null);
    const [loading, setLoading]     = useState(false);

    useEffect(() => {
        api.get('/students?per_page=999').then(r => setStudents(r.data.data || [])).catch(() => {});
    }, []);

    const fetchReport = async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            const r = await api.get(`/grades/report?student_id=${studentId}&semester=${semester}&academic_year=${academicYear}`);
            setReport(r.data);
        } catch { swal({ title: 'Error', text: 'Gagal memuat rapor', icon: 'error' }); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReport(); }, [studentId, semester, academicYear]);

    const handleExportRapor = () => {
        if (!report) return;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const s = report.student;

        // Header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setFontSize(16); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text('RAPOR SISWA', 105, 13, { align: 'center' });
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
        doc.text(`Semester ${report.semester} Â· Tahun Ajaran ${report.academic_year}`, 105, 21, { align: 'center' });
        doc.text('SistemSekolah â€” EduAdmin', 105, 29, { align: 'center' });

        // Student Info
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59);
        doc.text('DATA SISWA', 15, 46);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
        const info = [
            ['Nama', s.name],
            ['NISN', s.nisn || '-'],
            ['Jenis Kelamin', s.gender === 'L' ? 'Laki-laki' : 'Perempuan'],
        ];
        info.forEach(([k, v], i) => {
            doc.setTextColor(100); doc.text(k, 15, 54 + i*6);
            doc.setTextColor(30, 41, 59); doc.text(': ' + v, 50, 54 + i*6);
        });

        // Grade summary badges
        doc.setFontSize(11); doc.setFont('helvetica', 'bold');
        doc.setTextColor(99, 102, 241);
        doc.text(`Rata-rata: ${report.average ?? '-'}`, 120, 54);
        doc.setTextColor(30,41,59);
        doc.text(`Predikat: ${report.grade_letter}`, 120, 62);

        // Table
        autoTable(doc, {
            startY: 80,
            head: [['No', 'Mata Pelajaran', 'Tugas', 'UTS', 'UAS', 'Nilai Akhir', 'Predikat', 'Keterangan']],
            body: report.grades.map((g, i) => [
                i + 1,
                g.subject?.name || '-',
                g.score_tugas ?? '-',
                g.score_uts ?? '-',
                g.score_uas ?? '-',
                g.final_score ?? '-',
                g.grade_letter || '-',
                g.final_score >= 75 ? 'Tuntas' : g.final_score !== null ? 'Belum Tuntas' : '-',
            ]),
            headStyles: { fillColor: [99, 102, 241], textColor: [255,255,255], fontStyle: 'bold', fontSize: 9, halign: 'center' },
            bodyStyles: { fontSize: 8.5, textColor: [30,41,59] },
            alternateRowStyles: { fillColor: [245,243,255] },
            columnStyles: {
                0: { halign:'center', cellWidth: 10 },
                2: { halign:'center' }, 3: { halign:'center' },
                4: { halign:'center' }, 5: { halign:'center', fontStyle:'bold' },
                6: { halign:'center' }, 7: { halign:'center' },
            },
            margin: { left: 12, right: 12 },
            foot: [[{content: `Rata-rata Keseluruhan: ${report.average ?? '-'} (${report.grade_letter})`, colSpan: 8, styles: { halign:'right', fontStyle:'bold', fillColor:[240,238,255], textColor:[99,102,241] }}]],
            footStyles: { fontSize: 9 },
        });

        // Signature
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
        doc.text('Mengetahui,', 25, finalY);
        doc.text('Wali Kelas', 25, finalY + 5);
        doc.line(15, finalY + 25, 65, finalY + 25);
        doc.text('Kepala Sekolah', 140, finalY + 5);
        doc.line(130, finalY + 25, 190, finalY + 25);
        doc.setFontSize(7); doc.setTextColor(148, 163, 184);
        doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} â€” EduAdmin School System`, 105, doc.internal.pageSize.height - 5, { align:'center' });

        doc.save(`Rapor-${s.name}-Sem${report.semester}-${report.academic_year.replace('/','-')}.pdf`);
    };

    const overallLetterColor = report?.grade_letter ? (GRADE_CFG[report.grade_letter] || GRADE_CFG['-']) : GRADE_CFG['-'];

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}/>
                    <ModernSelect value={studentId} onChange={e => setStudentId(e.target.value)} className="input-dark text-sm pr-8 w-full appearance-none">
                        <option value="">Pilih Siswa</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} â€” {s.nisn}</option>)}
                    </ModernSelect>
                </div>
                <div className="relative">
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}/>
                    <ModernSelect value={semester} onChange={e => setSemester(Number(e.target.value))} className="input-dark text-sm pr-8 w-32 appearance-none">
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                    </ModernSelect>
                </div>
                <input value={academicYear} onChange={e => setAcYear(e.target.value)} className="input-dark text-sm w-28"/>
                <button onClick={handleExportRapor} disabled={!report?.grades?.length} className="btn-primary"
                    style={{ opacity: report?.grades?.length ? 1 : 0.5 }}>
                    <FileText size={13}/> Export Rapor PDF
                </button>
            </div>

            {!studentId ? (
                <div className="rounded-2xl flex flex-col items-center justify-center py-20"
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)' }}>
                    <Medal size={36} style={{ color:'var(--text-muted)', marginBottom:12 }}/>
                    <p className="font-semibold text-sm" style={{ color:'var(--text-secondary)' }}>Pilih siswa untuk melihat rapor</p>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="4"/>
                        <path className="opacity-75" fill="#6366f1" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                </div>
            ) : report && (
                <>
                    {/* Student Card */}
                    <div className="rounded-2xl p-5"
                        style={{ background:'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))', border:'1px solid rgba(99,102,241,0.2)' }}>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                                    style={{ background:'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                                    {report.student?.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-base font-bold" style={{ color:'var(--text-primary)' }}>{report.student?.name}</h2>
                                    <p className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>NISN: {report.student?.nisn}</p>
                                    <p className="text-xs mt-0.5" style={{ color:'var(--text-secondary)' }}>
                                        Semester {report.semester} Â· {report.academic_year}
                                    </p>
                                </div>
                            </div>
                            {/* Summary */}
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>Rata-rata</p>
                                    <p className="text-3xl font-black" style={{ color: overallLetterColor.color }}>
                                        {report.average ?? '-'}
                                    </p>
                                </div>
                                <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
                                    style={{ background: overallLetterColor.bg, border:`2px solid ${overallLetterColor.border}` }}>
                                    <p className="text-2xl font-black" style={{ color: overallLetterColor.color }}>{report.grade_letter}</p>
                                    <p className="text-xs" style={{ color: overallLetterColor.color }}>{overallLetterColor.label}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grades Table */}
                    <div className="rounded-2xl overflow-hidden"
                        style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)', boxShadow:'var(--shadow-card)' }}>
                        {report.grades.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Star size={28} style={{ color:'var(--text-muted)', marginBottom:8 }}/>
                                <p className="text-sm" style={{ color:'var(--text-secondary)' }}>Belum ada nilai di semester ini</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-table-head)' }}>
                                        {['No','Mata Pelajaran','Tugas','UTS','UAS','Nilai Akhir','Predikat','Status'].map((h,i) => (
                                            <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-center"
                                                style={{ color:'var(--text-th)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.grades.map((g, i) => {
                                        const tuntas = g.final_score >= 75;
                                        return (
                                            <tr key={g.id}
                                                style={{ borderBottom:'1px solid var(--border)', background:i%2!==0?'var(--bg-table-even)':'transparent' }}
                                                onMouseEnter={e => e.currentTarget.style.background='var(--bg-table-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background=i%2!==0?'var(--bg-table-even)':'transparent'}
                                            >
                                                <td className="py-2.5 px-4 text-xs text-center" style={{ color:'var(--text-muted)' }}>{i+1}</td>
                                                <td className="py-2.5 px-4 text-sm font-medium" style={{ color:'var(--text-primary)' }}>{g.subject?.name}</td>
                                                <td className="py-2.5 px-4 text-sm text-center font-mono" style={{ color:'var(--text-secondary)' }}>{g.score_tugas ?? '-'}</td>
                                                <td className="py-2.5 px-4 text-sm text-center font-mono" style={{ color:'var(--text-secondary)' }}>{g.score_uts ?? '-'}</td>
                                                <td className="py-2.5 px-4 text-sm text-center font-mono" style={{ color:'var(--text-secondary)' }}>{g.score_uas ?? '-'}</td>
                                                <td className="py-2.5 px-4 text-center">
                                                    <span className="text-base font-black" style={{ color: g.final_score >= 75?'#34d399':g.final_score>=60?'#fbbf24':g.final_score!==null?'#f87171':'var(--text-muted)' }}>
                                                        {g.final_score ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 px-4 flex justify-center"><GradeBadge letter={g.grade_letter}/></td>
                                                <td className="py-2.5 px-4 text-center">
                                                    {g.final_score !== null ? (
                                                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                                            style={{ background: tuntas?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)', color: tuntas?'#34d399':'#f87171', border:`1px solid ${tuntas?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.25)'}` }}>
                                                            {tuntas ? 'âœ“ Tuntas' : 'âœ— Belum Tuntas'}
                                                        </span>
                                                    ) : <span className="text-xs" style={{ color:'var(--text-muted)' }}>-</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr style={{ borderTop:'2px solid var(--border)', background:'var(--bg-table-head)' }}>
                                        <td colSpan={5} className="py-3 px-4 text-xs font-semibold text-right" style={{ color:'var(--text-th)' }}>
                                            Rata-rata Keseluruhan:
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="text-base font-black" style={{ color: overallLetterColor.color }}>{report.average ?? '-'}</span>
                                        </td>
                                        <td className="py-3 px-4 flex justify-center"><GradeBadge letter={report.grade_letter}/></td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="text-xs font-semibold" style={{ color: overallLetterColor.color }}>
                                                {overallLetterColor.label}
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

