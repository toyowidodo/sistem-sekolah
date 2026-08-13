import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle2, Circle, ArrowRight, ListChecks } from 'lucide-react';

/**
 * Checklist kesiapan data di dashboard.
 *
 * Dashboard sebelumnya hanya menyajikan deretan angka nol tanpa memberi tahu
 * apa yang kurang — terasa seperti aplikasi rusak, padahal datanya memang
 * belum diisi. Panel ini menyebutkan sisa langkahnya beserta tautan langsung
 * ke menu yang bersangkutan.
 *
 * Otomatis menghilang begitu semua langkah selesai, supaya tidak jadi
 * gangguan permanen bagi sekolah yang datanya sudah lengkap.
 */
export default function SetupProgress() {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get('/dashboard/setup-progress')
            .then(res => setData(res.data))
            .catch(() => setData(null));
    }, []);

    if (!data || data.complete) return null;

    const persen = Math.round((data.done / data.total) * 100);

    return (
        <div className="rounded-2xl p-5 border"
            style={{ background: 'var(--bg-card)', borderColor: 'rgba(99,102,241,0.25)' }}>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <ListChecks size={18} style={{ color: '#818cf8' }} /> Kesiapan Data
                </h2>
                <span className="text-sm font-bold" style={{ color: '#818cf8' }}>
                    {data.done} dari {data.total} selesai
                </span>
            </div>

            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                Sebagian besar fitur baru menampilkan isi setelah langkah-langkah ini terpenuhi.
                {data.academic_year && <> Tahun ajaran aktif: <strong>{data.academic_year}</strong>.</>}
            </p>

            {/* Bilah progres */}
            <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'var(--bg-input)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${persen}%`, background: 'linear-gradient(90deg,#6366f1,#06b6d4)' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.steps.map(step => (
                    <Link key={step.key} to={step.path}
                        className="flex items-start gap-2.5 p-3 rounded-xl transition-all group"
                        style={{
                            background: step.done ? 'transparent' : 'var(--bg-input)',
                            border: `1px solid ${step.done ? 'transparent' : 'var(--border-input)'}`,
                        }}>
                        {step.done
                            ? <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0, marginTop: 1 }} />
                            : <Circle size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} />}

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold"
                                    style={{ color: step.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                    {step.label}
                                </span>
                                <span className="text-xs font-mono px-1.5 rounded"
                                    style={{
                                        background: step.done ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)',
                                        color: step.done ? '#34d399' : '#818cf8',
                                    }}>
                                    {step.total !== undefined ? `${step.count}/${step.total}` : step.count}
                                </span>
                            </div>
                            {!step.done && (
                                <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>
                                    {step.hint}
                                </p>
                            )}
                        </div>

                        {!step.done && (
                            <ArrowRight size={13} className="opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0 mt-1"
                                style={{ color: 'var(--text-muted)' }} />
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
