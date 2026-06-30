import { useEffect, useState, useCallback } from 'react';
import api from '../../../api/axios';
import { Award, BookOpen, Save, FileText, ChevronDown, RefreshCw, TrendingUp, Star, Medal } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { swal, GRADE_CFG, GradeBadge, ScoreInput, CURRENT_YEAR } from './Shared';
import ModernSelect from '../../../components/ModernSelect';

export default function TabRekap({ classrooms }) {
    const [classroomId, setClassroomId] = useState('');
    const [semester, setSemester]       = useState(1);
    const [academicYear, setAcYear]     = useState(CURRENT_YEAR);
    const [data, setData]               = useState([]);
    const [loading, setLoading]         = useState(false);

    const fetchRecap = async () => {
        if (!classroomId) return;
        setLoading(true);
        try {
            const r = await api.get(`/grades/recap?classroom_id=${classroomId}&semester=${semester}&academic_year=${academicYear}`);
            setData(r.data.data || []);
        } catch { swal({ title: 'Error', text: 'Gagal memuat rekap', icon: 'error' }); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRecap(); }, [classroomId, semester, academicYear]);

    const handleExportPDF = () => {
        if (!data.length) return;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const classroomName = classrooms.find(c => c.id == classroomId)?.name || 'Kelas';

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 297, 28, 'F');
        doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
        doc.text(`REKAP NILAI â€” ${classroomName}`, 148, 12, { align: 'center' });
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
        doc.text(`Semester ${semester} Â· Tahun Ajaran ${academicYear}`, 148, 21, { align: 'center' });

        // Get all unique subjects
        const allSubjects = [...new Set(data.flatMap(s => s.subjects.map(sub => sub.subject)))];

        autoTable(doc, {
            startY: 34,
            head: [['No', 'NISN', 'Nama Siswa', ...allSubjects, 'Rata-rata', 'Grade', 'Ranking']],
            body: data.map((s, i) => {
                const subScores = allSubjects.map(subj => {
                    const found = s.subjects.find(x => x.subject === subj);
                    return found?.final_score ?? '-';
                });
                return [i + 1, s.nisn, s.student_name, ...subScores, s.average ?? '-', s.grade_letter, s.rank];
            }),
            headStyles: { fillColor: [99, 102, 241], textColor: [255,255,255], fontStyle: 'bold', fontSize: 7, halign: 'center' },
            bodyStyles: { fontSize: 7, textColor: [30,41,59] },
            alternateRowStyles: { fillColor: [245,243,255] },
            columnStyles: { 0: { halign:'center', cellWidth:8 }, 1: { cellWidth:22 } },
            margin: { left: 8, right: 8 },
        });
        doc.save(`Rekap-Nilai-${classroomName}-Sem${semester}-${academicYear.replace('/','-')}.pdf`);
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}/>
                    <ModernSelect value={classroomId} onChange={e => setClassroomId(e.target.value)} className="input-dark text-sm pr-8 w-40 appearance-none">
                        <option value="">Pilih Kelas</option>
                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </ModernSelect>
                </div>
                <div className="relative">
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}/>
                    <ModernSelect value={semester} onChange={e => setSemester(Number(e.target.value))} className="input-dark text-sm pr-8 w-32 appearance-none">
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                    </ModernSelect>
                </div>
                <input value={academicYear} onChange={e => setAcYear(e.target.value)} className="input-dark text-sm w-28" />
                <button onClick={fetchRecap} className="btn-ghost"><RefreshCw size={13}/> Muat</button>
                <div className="flex-1"/>
                <button onClick={handleExportPDF} disabled={!data.length} className="btn-ghost" style={{ opacity: data.length ? 1 : 0.5 }}>
                    <FileText size={13}/> Export PDF
                </button>
            </div>

            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                {!classroomId ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <TrendingUp size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }}/>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Pilih kelas untuk melihat rekap</p>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="4"/>
                            <path className="opacity-75" fill="#6366f1" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Award size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }}/>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Belum ada data nilai</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                                    {['Rank','Nama Siswa', ...( data[0]?.subjects.map(s=>s.subject)||[]), 'Rata-rata','Grade'].map((h,i) => (
                                        <th key={i} className="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-center whitespace-nowrap"
                                            style={{ color: 'var(--text-th)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((s, i) => (
                                    <tr key={s.student_id}
                                        style={{ borderBottom: '1px solid var(--border)', background: i%2!==0?'var(--bg-table-even)':'transparent' }}
                                        onMouseEnter={e => e.currentTarget.style.background='var(--bg-table-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background=i%2!==0?'var(--bg-table-even)':'transparent'}
                                    >
                                        <td className="py-2.5 px-3 text-center">
                                            {s.rank <= 3 ? (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                                                    style={{
                                                        background: s.rank===1?'rgba(251,191,36,0.2)':s.rank===2?'rgba(148,163,184,0.2)':'rgba(180,83,9,0.2)',
                                                        color: s.rank===1?'#fbbf24':s.rank===2?'#94a3b8':'#b45309',
                                                    }}>
                                                    {s.rank}
                                                </span>
                                            ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.rank}</span>}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.student_name}</p>
                                            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{s.nisn}</p>
                                        </td>
                                        {s.subjects.map((subj, j) => (
                                            <td key={j} className="py-2.5 px-3 text-center text-sm font-mono"
                                                style={{ color: subj.final_score >= 75 ? '#34d399' : subj.final_score >= 60 ? '#fbbf24' : subj.final_score !== null ? '#f87171' : 'var(--text-muted)' }}>
                                                {subj.final_score ?? '-'}
                                            </td>
                                        ))}
                                        <td className="py-2.5 px-3 text-center">
                                            <span className="text-sm font-bold" style={{ color: s.average >= 75 ? '#34d399' : s.average >= 60 ? '#fbbf24' : '#f87171' }}>
                                                {s.average ?? '-'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 flex justify-center">
                                            <GradeBadge letter={s.grade_letter} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-4 py-3 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-footer)' }}>
                            {data.length} siswa Â· Semester {semester} Â· {academicYear}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

