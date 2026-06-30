import { useEffect, useState, useCallback } from 'react';
import api from '../../../api/axios';
import { Award, BookOpen, Save, FileText, ChevronDown, RefreshCw, TrendingUp, Star, Medal } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { swal, GRADE_CFG, GradeBadge, ScoreInput, CURRENT_YEAR } from './Shared';
import ModernSelect from '../../../components/ModernSelect';

export default function TabInputNilai({ classrooms, subjects }) {
    const [classroomId, setClassroomId] = useState('');
    const [subjectId, setSubjectId]     = useState('');
    const [semester, setSemester]       = useState(1);
    const [academicYear, setAcYear]     = useState(CURRENT_YEAR);
    const [rows, setRows]               = useState([]);
    const [loading, setLoading]         = useState(false);
    const [saving, setSaving]           = useState(false);
    const [dirty, setDirty]             = useState(false);

    const computeFinal = (tugas, uts, uas) => {
        let score = 0, weight = 0;
        if (tugas !== null && tugas !== undefined) { score += tugas * 0.4; weight += 0.4; }
        if (uts   !== null && uts   !== undefined) { score += uts   * 0.3; weight += 0.3; }
        if (uas   !== null && uas   !== undefined) { score += uas   * 0.3; weight += 0.3; }
        if (weight === 0) return null;
        return Math.round((score / weight) * 10) / 10;
    };

    const letterGrade = (score) => {
        if (score === null || score === undefined) return '-';
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'E';
    };

    const fetchGrades = useCallback(async () => {
        if (!classroomId || !subjectId) return;
        setLoading(true);
        try {
            const r = await api.get(`/grades?classroom_id=${classroomId}&subject_id=${subjectId}&semester=${semester}&academic_year=${academicYear}`);
            setRows(r.data.data || []);
            setDirty(false);
        } catch { swal({ title: 'Error', text: 'Gagal memuat nilai', icon: 'error' }); }
        finally { setLoading(false); }
    }, [classroomId, subjectId, semester, academicYear]);

    useEffect(() => { fetchGrades(); }, [fetchGrades]);

    const updateRow = (idx, field, val) => {
        setRows(prev => prev.map((r, i) => {
            if (i !== idx) return r;
            const updated = { ...r, [field]: val };
            const final = computeFinal(
                field === 'score_tugas' ? val : updated.score_tugas,
                field === 'score_uts'   ? val : updated.score_uts,
                field === 'score_uas'   ? val : updated.score_uas,
            );
            updated.final_score  = final;
            updated.grade_letter = letterGrade(final);
            return updated;
        }));
        setDirty(true);
    };

    const handleSave = async () => {
        if (!classroomId || !subjectId) {
            swal({ title: 'Pilih Kelas & Mapel', text: 'Pilih kelas dan mata pelajaran terlebih dahulu.', icon: 'warning' });
            return;
        }
        setSaving(true);
        try {
            await api.post('/grades/bulk', {
                classroom_id: classroomId,
                subject_id: subjectId,
                semester, academic_year: academicYear,
                grades: rows.map(r => ({
                    student_id: r.student_id,
                    score_tugas: r.score_tugas,
                    score_uts: r.score_uts,
                    score_uas: r.score_uas,
                    notes: r.notes || '',
                })),
            });
            swal({ title: 'Tersimpan!', text: 'Nilai berhasil disimpan.', icon: 'success', timer: 1500, showConfirmButton: false });
            setDirty(false);
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal menyimpan', icon: 'error' });
        } finally { setSaving(false); }
    };

    // Stats
    const withScore = rows.filter(r => r.final_score !== null);
    const avg = withScore.length ? (withScore.reduce((s, r) => s + r.final_score, 0) / withScore.length).toFixed(1) : '-';
    const highest = withScore.length ? Math.max(...withScore.map(r => r.final_score)) : '-';
    const lowest  = withScore.length ? Math.min(...withScore.map(r => r.final_score)) : '-';

    const subjectName = subjects.find(s => s.id == subjectId)?.name || '-';
    const classroomName = classrooms.find(c => c.id == classroomId)?.name || '-';

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Kelas */}
                <div className="relative">
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}/>
                    <ModernSelect value={classroomId} onChange={e => setClassroomId(e.target.value)} className="input-dark text-sm pr-8 w-full appearance-none">
                        <option value="">Pilih Kelas</option>
                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </ModernSelect>
                </div>
                {/* Mapel */}
                <div className="relative">
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}/>
                    <ModernSelect value={subjectId} onChange={e => setSubjectId(e.target.value)} className="input-dark text-sm pr-8 w-full appearance-none">
                        <option value="">Pilih Mata Pelajaran</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </ModernSelect>
                </div>
                {/* Semester */}
                <div className="relative">
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}/>
                    <ModernSelect value={semester} onChange={e => setSemester(Number(e.target.value))} className="input-dark text-sm pr-8 w-full appearance-none">
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                    </ModernSelect>
                </div>
                {/* Tahun ajaran */}
                <input value={academicYear} onChange={e => setAcYear(e.target.value)}
                    placeholder="2024/2025" className="input-dark text-sm" />
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    {[
                        { label: 'Rata-rata', value: avg, color: '#818cf8' },
                        { label: 'Tertinggi', value: highest, color: '#34d399' },
                        { label: 'Terendah', value: lowest, color: '#f87171' },
                        { label: 'Siswa', value: rows.length, color: '#fbbf24' },
                    ].map((s, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-xl text-xs"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{s.label}: </span>
                            <span className="font-bold" style={{ color: s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>
                <button onClick={handleSave} disabled={saving || !dirty || !classroomId || !subjectId}
                    className="btn-primary" style={{ opacity: (!dirty || saving || !classroomId || !subjectId) ? 0.5 : 1 }}>
                    {saving
                        ? <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Menyimpan...</>
                        : <><Save size={13}/> Simpan Nilai</>}
                </button>
            </div>

            {/* Grades Table */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                {!classroomId || !subjectId ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <BookOpen size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }}/>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Pilih kelas dan mata pelajaran</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>untuk mulai input nilai</p>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="4"/>
                            <path className="opacity-75" fill="#6366f1" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat data nilai...</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="px-4 py-2.5 flex items-center justify-between"
                            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.05)' }}>
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                {classroomName} Â· {subjectName} Â· Sem {semester} Â· {academicYear}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Bobot: Tugas 40% Â· UTS 30% Â· UAS 30%
                            </p>
                        </div>
                        {/* Table Head */}
                        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
                            style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-th)', background: 'var(--bg-table-head)' }}>
                            <div className="col-span-1 text-center">#</div>
                            <div className="col-span-3">Nama Siswa</div>
                            <div className="col-span-2 text-center">Tugas (40%)</div>
                            <div className="col-span-2 text-center">UTS (30%)</div>
                            <div className="col-span-2 text-center">UAS (30%)</div>
                            <div className="col-span-1 text-center">Akhir</div>
                            <div className="col-span-1 text-center">Grade</div>
                        </div>
                        {/* Rows */}
                        <div>
                            {rows.map((row, i) => (
                                <div key={row.student_id}
                                    className="grid grid-cols-12 gap-2 px-4 py-2 items-center"
                                    style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}>
                                    <div className="col-span-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>{i + 1}</div>
                                    <div className="col-span-3">
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.student_name}</p>
                                        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{row.nisn}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <ScoreInput value={row.score_tugas} onChange={v => updateRow(i, 'score_tugas', v)} />
                                    </div>
                                    <div className="col-span-2">
                                        <ScoreInput value={row.score_uts} onChange={v => updateRow(i, 'score_uts', v)} />
                                    </div>
                                    <div className="col-span-2">
                                        <ScoreInput value={row.score_uas} onChange={v => updateRow(i, 'score_uas', v)} />
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <span className="text-sm font-bold" style={{
                                            color: row.final_score >= 75 ? '#34d399' : row.final_score >= 60 ? '#fbbf24' : row.final_score !== null ? '#f87171' : 'var(--text-muted)'
                                        }}>
                                            {row.final_score ?? '-'}
                                        </span>
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <GradeBadge letter={row.grade_letter} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Footer */}
                        <div className="px-4 py-2.5 flex items-center justify-between text-xs"
                            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-footer)' }}>
                            <span>{rows.length} siswa</span>
                            <span style={{ color: dirty ? '#fbbf24' : 'var(--text-footer)' }}>
                                {dirty ? 'â— Ada perubahan yang belum disimpan' : 'âœ“ Data tersimpan'}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

