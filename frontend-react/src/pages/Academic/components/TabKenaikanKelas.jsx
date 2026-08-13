import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import ModernSelect from '../../../components/ModernSelect';
import Swal from 'sweetalert2';
import { GraduationCap, ArrowRight, Users, Wand2, AlertTriangle } from 'lucide-react';

const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-1.5';
const labelStyle = { color: 'var(--text-label)' };
const swal = (opts) => Swal.fire({ background: 'var(--bg-modal)', color: 'var(--text-primary)', ...opts });

const ACTION_CFG = {
    naik:    { label: 'Naik Kelas',   color: '#34d399' },
    tinggal: { label: 'Tinggal Kelas', color: '#fbbf24' },
    lulus:   { label: 'Lulus',        color: '#818cf8' },
    keluar:  { label: 'Keluar',       color: '#f87171' },
};

export default function TabKenaikanKelas({ classrooms = [] }) {
    const [years, setYears] = useState([]);
    const [fromYear, setFromYear] = useState('');
    const [toYear, setToYear] = useState('');
    const [sourceClass, setSourceClass] = useState('');

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const [bulkTarget, setBulkTarget] = useState('');

    useEffect(() => {
        api.get('/academic-years').then(res => {
            const list = res.data.data || [];
            setYears(list);
            setFromYear(res.data.active || list[0]?.name || '');
        }).catch(() => {});
    }, []);

    const loadStudents = async () => {
        if (!sourceClass) {
            swal({ title: 'Pilih kelas asal', icon: 'info' });
            return;
        }
        setLoading(true);
        try {
            const res = await api.get('/promotions/preview', {
                params: { classroom_id: sourceClass, academic_year: fromYear },
            });
            setRows((res.data.data || []).map(s => ({
                ...s,
                selected: !s.already_decided,
                action: 'naik',
                target_classroom_id: '',
            })));
            setLoaded(true);
        } catch (err) {
            swal({ title: 'Error', text: err.response?.data?.message || 'Gagal memuat siswa', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const patchRow = (id, patch) =>
        setRows(rs => rs.map(r => (r.student_id === id ? { ...r, ...patch } : r)));

    const applyBulk = () => {
        if (!bulkTarget) {
            swal({ title: 'Pilih kelas tujuan dulu', icon: 'info' });
            return;
        }
        setRows(rs => rs.map(r => r.selected ? { ...r, action: 'naik', target_classroom_id: bulkTarget } : r));
    };

    const selected = rows.filter(r => r.selected);

    const handleExecute = async () => {
        if (!fromYear || !toYear) {
            swal({ title: 'Lengkapi tahun ajaran', text: 'Tahun ajaran asal dan tujuan wajib diisi.', icon: 'info' });
            return;
        }
        if (fromYear === toYear) {
            swal({ title: 'Tahun ajaran sama', text: 'Tahun ajaran tujuan harus berbeda dari asal.', icon: 'info' });
            return;
        }
        if (selected.length === 0) {
            swal({ title: 'Belum ada siswa dipilih', icon: 'info' });
            return;
        }

        const kurangTujuan = selected.filter(r => r.action === 'naik' && !r.target_classroom_id);
        if (kurangTujuan.length > 0) {
            swal({
                title: 'Kelas tujuan belum lengkap',
                text: `${kurangTujuan.length} siswa yang naik kelas belum punya kelas tujuan.`,
                icon: 'warning',
            });
            return;
        }

        const ringkasan = Object.entries(
            selected.reduce((acc, r) => ({ ...acc, [r.action]: (acc[r.action] || 0) + 1 }), {})
        ).map(([k, v]) => `${v} ${ACTION_CFG[k].label.toLowerCase()}`).join(', ');

        const confirm = await swal({
            title: 'Jalankan kenaikan kelas?',
            html: `<p>${selected.length} siswa akan diproses: <b>${ringkasan}</b>.</p>
                   <p style="margin-top:8px">Dari <b>${fromYear}</b> ke <b>${toYear}</b>.</p>
                   <p style="margin-top:8px;font-size:13px;opacity:.75">Siswa yang lulus atau keluar akan dinonaktifkan dan dikeluarkan dari kelas.</p>`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Ya, Jalankan', cancelButtonText: 'Batal',
        });
        if (!confirm.isConfirmed) return;

        setSaving(true);
        try {
            const res = await api.post('/promotions/execute', {
                from_academic_year: fromYear,
                to_academic_year: toYear,
                promotions: selected.map(r => ({
                    student_id: r.student_id,
                    action: r.action,
                    target_classroom_id: r.action === 'naik' ? r.target_classroom_id : null,
                })),
            });
            swal({ title: 'Berhasil', text: res.data.message, icon: 'success' });
            setRows([]);
            setLoaded(false);
        } catch (err) {
            const v = err.response?.data?.errors;
            swal({
                title: 'Gagal',
                text: v ? Object.values(v).flat().join('\n') : err.response?.data?.message || 'Terjadi kesalahan',
                icon: 'error',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Pengaturan */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className={labelClass} style={labelStyle}>Tahun Ajaran Asal</label>
                        <input list="ta-list" value={fromYear} onChange={e => setFromYear(e.target.value)}
                            className="input-dark w-full" placeholder="2025/2026" />
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Tahun Ajaran Tujuan</label>
                        <input list="ta-list" value={toYear} onChange={e => setToYear(e.target.value)}
                            className="input-dark w-full" placeholder="2026/2027" />
                    </div>
                    <datalist id="ta-list">
                        {years.map(y => <option key={y.id} value={y.name} />)}
                    </datalist>
                    <div>
                        <label className={labelClass} style={labelStyle}>Kelas Asal</label>
                        <ModernSelect value={sourceClass} onChange={e => setSourceClass(e.target.value)} className="input-dark w-full">
                            <option value="">-- Pilih Kelas --</option>
                            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </ModernSelect>
                    </div>
                    <div className="flex items-end">
                        <button onClick={loadStudents} disabled={loading} className="btn-primary w-full justify-center">
                            <Users size={13} /> {loading ? 'Memuat...' : 'Tampilkan Siswa'}
                        </button>
                    </div>
                </div>
            </div>

            {loaded && rows.length === 0 && (
                <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
                    Tidak ada siswa aktif di kelas ini.
                </div>
            )}

            {rows.length > 0 && (
                <>
                    {/* Aksi massal */}
                    <div className="rounded-2xl p-4 flex flex-wrap items-end gap-3"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                        <div className="flex-1 min-w-48">
                            <label className={labelClass} style={labelStyle}>Naikkan semua yang dicentang ke</label>
                            <ModernSelect value={bulkTarget} onChange={e => setBulkTarget(e.target.value)} className="input-dark w-full">
                                <option value="">-- Pilih Kelas Tujuan --</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </ModernSelect>
                        </div>
                        <button onClick={applyBulk} className="btn-ghost"><Wand2 size={13} /> Terapkan ke {selected.length} Siswa</button>
                    </div>

                    {/* Tabel siswa */}
                    <div className="rounded-2xl overflow-hidden"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                                        <th className="py-3 px-4">
                                            <input type="checkbox"
                                                checked={rows.every(r => r.selected)}
                                                onChange={e => setRows(rs => rs.map(r => ({ ...r, selected: e.target.checked })))} />
                                        </th>
                                        {['NISN', 'Nama Siswa', 'Rata-rata', 'Keputusan', 'Kelas Tujuan'].map((h, i) => (
                                            <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--text-th)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, i) => (
                                        <tr key={r.student_id}
                                            style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}>
                                            <td className="py-3 px-4">
                                                <input type="checkbox" checked={r.selected}
                                                    onChange={e => patchRow(r.student_id, { selected: e.target.checked })} />
                                            </td>
                                            <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.nisn}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</span>
                                                {r.already_decided && (
                                                    <span className="ml-2 inline-flex items-center gap-1 text-xs" style={{ color: '#fbbf24' }}>
                                                        <AlertTriangle size={10} /> sudah diproses ({r.decided_status})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-bold"
                                                style={{ color: r.average >= 75 ? '#34d399' : r.average ? '#fbbf24' : 'var(--text-muted)' }}>
                                                {r.average ?? '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <ModernSelect value={r.action} className="input-dark text-sm"
                                                    onChange={e => patchRow(r.student_id, { action: e.target.value })}>
                                                    {Object.entries(ACTION_CFG).map(([k, cfg]) => (
                                                        <option key={k} value={k}>{cfg.label}</option>
                                                    ))}
                                                </ModernSelect>
                                            </td>
                                            <td className="py-3 px-4">
                                                {r.action === 'naik' ? (
                                                    <ModernSelect value={r.target_classroom_id} className="input-dark text-sm"
                                                        onChange={e => patchRow(r.student_id, { target_classroom_id: e.target.value })}>
                                                        <option value="">-- Pilih --</option>
                                                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </ModernSelect>
                                                ) : (
                                                    <span className="text-xs" style={{ color: ACTION_CFG[r.action].color }}>
                                                        {ACTION_CFG[r.action].label}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3"
                            style={{ borderTop: '1px solid var(--border)' }}>
                            <span className="text-xs" style={{ color: 'var(--text-footer)' }}>
                                {selected.length} dari {rows.length} siswa dipilih
                            </span>
                            <button onClick={handleExecute} disabled={saving} className="btn-primary"
                                style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
                                <GraduationCap size={13} /> {saving ? 'Memproses...' : 'Jalankan Kenaikan Kelas'}
                                {!saving && <ArrowRight size={13} />}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
