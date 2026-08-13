import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, CornerDownLeft, Users, GraduationCap, School, BookOpen, Loader2 } from 'lucide-react';

const TYPE_CFG = {
    siswa: { icon: Users,         label: 'Siswa',          color: '#818cf8' },
    guru:  { icon: GraduationCap, label: 'Guru',           color: '#34d399' },
    kelas: { icon: School,        label: 'Kelas',          color: '#22d3ee' },
    mapel: { icon: BookOpen,      label: 'Mata Pelajaran', color: '#fbbf24' },
};

/**
 * Pencarian cepat lintas modul, dibuka dengan Ctrl+K.
 *
 * Dengan 100+ siswa, menemukan satu orang berarti membuka menu Data Siswa lalu
 * menyusuri halaman demi halaman. Palette ini memangkasnya jadi dua ketukan.
 *
 * Penyaringan hak akses dikerjakan di server — komponen ini hanya menampilkan
 * apa pun yang dikembalikan, jadi tidak ada data yang bocor lewat sini.
 */
export default function CommandPalette() {
    const [open, setOpen]       = useState(false);
    const [q, setQ]             = useState('');
    const [hasil, setHasil]     = useState([]);
    const [loading, setLoading] = useState(false);
    const [aktif, setAktif]     = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    /* ── Ctrl+K membuka, Esc menutup ── */
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen(o => !o);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        if (open) {
            setQ(''); setHasil([]); setAktif(0);
            // Fokus setelah modal tergambar, kalau tidak input belum ada di DOM
            const t = setTimeout(() => inputRef.current?.focus(), 40);
            return () => clearTimeout(t);
        }
    }, [open]);

    /* ── Cari dengan jeda, supaya tiap ketukan huruf tidak memicu request ── */
    useEffect(() => {
        if (q.trim().length < 2) { setHasil([]); setLoading(false); return; }

        setLoading(true);
        const batal = new AbortController();
        const t = setTimeout(() => {
            api.get('/search', { params: { q }, signal: batal.signal })
                .then(r => { setHasil(r.data.data || []); setAktif(0); })
                .catch(() => { /* permintaan dibatalkan atau gagal — biarkan hasil lama */ })
                .finally(() => setLoading(false));
        }, 250);

        return () => { clearTimeout(t); batal.abort(); };
    }, [q]);

    const pilih = useCallback((item) => {
        if (!item) return;
        setOpen(false);
        navigate(item.path);
    }, [navigate]);

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setAktif(i => Math.min(i + 1, hasil.length - 1)); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); setAktif(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter')     { e.preventDefault(); pilih(hasil[aktif]); }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
            onClick={() => setOpen(false)}>

            <div className="w-full max-w-xl rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-modal)', border: '1px solid var(--border-modal)', boxShadow: 'var(--shadow-modal)' }}
                onClick={e => e.stopPropagation()}>

                {/* Kolom pencarian */}
                <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <Search size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                        ref={inputRef}
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Cari siswa, guru, kelas, atau mata pelajaran..."
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: 'var(--text-primary)' }}
                    />
                    {loading && <Loader2 size={15} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
                    <kbd className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-input)' }}>
                        Esc
                    </kbd>
                </div>

                {/* Hasil */}
                <div className="max-h-[52vh] overflow-y-auto">
                    {q.trim().length < 2 ? (
                        <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                            Ketik minimal 2 huruf untuk mulai mencari
                        </p>
                    ) : (!loading && hasil.length === 0) ? (
                        <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                            Tidak ada yang cocok dengan &quot;{q}&quot;
                        </p>
                    ) : (
                        hasil.map((item, i) => {
                            const cfg = TYPE_CFG[item.type] || TYPE_CFG.siswa;
                            const dipilih = i === aktif;
                            return (
                                <button
                                    key={`${item.type}-${item.label}-${i}`}
                                    onClick={() => pilih(item)}
                                    onMouseEnter={() => setAktif(i)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                                    style={{ background: dipilih ? 'var(--bg-table-hover)' : 'transparent' }}>

                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: `${cfg.color}1f`, color: cfg.color }}>
                                        <cfg.icon size={14} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                            {item.label}
                                        </p>
                                        {item.meta && (
                                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.meta}</p>
                                        )}
                                    </div>

                                    <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                                        style={{ background: `${cfg.color}14`, color: cfg.color }}>
                                        {cfg.label}
                                    </span>

                                    {dipilih && <CornerDownLeft size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Petunjuk tombol */}
                <div className="flex items-center gap-4 px-4 py-2 text-xs"
                    style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    <span>&uarr;&darr; pilih</span>
                    <span>&crarr; buka</span>
                    <span className="ml-auto">Ctrl+K</span>
                </div>
            </div>
        </div>
    );
}
