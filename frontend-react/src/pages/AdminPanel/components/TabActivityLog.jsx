import { useEffect, useState, useCallback } from 'react';
import api from '../../../api/axios';
import { Activity, Search, RefreshCw, Clock, Database, ChevronDown } from 'lucide-react';
import { swal, EVENT_CFG, fmtDate } from './Shared';
import ModernDatepicker from '../../../components/ModernDatepicker';
import ModernSelect from '../../../components/ModernSelect';

export default function TabActivityLog() {
    const [logs, setLogs]       = useState([]);
    const [total, setTotal]     = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch]   = useState('');
    const [dateFilter, setDate] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [subjectType, setSubjectType] = useState('');
    const [eventFilter, setEventFilter] = useState('');
    const [page, setPage]       = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [options, setOptions] = useState({ subject_types: [], events: [] });

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (dateFilter) params.set('date', dateFilter);
            if (subjectType) params.set('subject_type', subjectType);
            if (eventFilter) params.set('event', eventFilter);
            params.set('page', page);

            const r = await api.get(`/activity-logs?${params}`);
            setLogs(r.data.data || []);
            setTotal(r.data.total || 0);
            setLastPage(r.data.last_page || 1);
        } catch { swal({ title:'Error', text:'Gagal memuat activity log', icon:'error' }); }
        finally { setLoading(false); }
    }, [search, dateFilter, subjectType, eventFilter, page]);

    useEffect(() => { fetch(); }, [fetch]);

    // Isi dropdown filter dari modul & aksi yang benar-benar ada di log
    useEffect(() => {
        api.get('/activity-logs/filters')
            .then(r => setOptions({ subject_types: r.data.subject_types || [], events: r.data.events || [] }))
            .catch(() => {});
    }, []);

    // Filter apa pun yang berubah harus mengembalikan tampilan ke halaman 1,
    // kalau tidak hasilnya bisa kosong karena masih menunjuk halaman lama
    const changeFilter = (setter) => (value) => { setter(value); setPage(1); };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:'var(--text-muted)' }}/>
                    <input type="text" value={search} onChange={e => changeFilter(setSearch)(e.target.value)}
                        placeholder="Cari aktivitas atau deskripsi..." className="input-dark pl-9 text-sm w-full"/>
                </div>

                <ModernSelect value={subjectType} onChange={e => changeFilter(setSubjectType)(e.target.value)}
                    className="input-dark text-sm">
                    <option value="">Semua Modul</option>
                    {options.subject_types.map(t => <option key={t} value={t}>{t}</option>)}
                </ModernSelect>

                <ModernSelect value={eventFilter} onChange={e => changeFilter(setEventFilter)(e.target.value)}
                    className="input-dark text-sm">
                    <option value="">Semua Aksi</option>
                    {options.events.map(e => <option key={e} value={e}>{EVENT_CFG[e]?.label || e}</option>)}
                </ModernSelect>

                <ModernDatepicker value={dateFilter} onChange={e => changeFilter(setDate)(e.target.value)} className="input-dark text-sm w-36"/>
                {(dateFilter || subjectType || eventFilter || search) && (
                    <button onClick={() => { setSearch(''); setDate(''); setSubjectType(''); setEventFilter(''); setPage(1); }}
                        className="btn-ghost">Reset</button>
                )}
                <button onClick={fetch} className="btn-ghost"><RefreshCw size={13}/> Refresh</button>
                <span className="text-xs" style={{ color:'var(--text-muted)' }}>{total} aktivitas</span>
            </div>

            {/* Stats row — dihitung dari baris yang sedang tampil, bukan seluruh log */}
            <p className="text-xs" style={{ color:'var(--text-muted)' }}>Rincian aksi pada halaman ini:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(EVENT_CFG).filter(([k]) => k !== 'default').map(([key, cfg]) => {
                    const count = logs.filter(l => l.event === key).length;
                    return (
                        <div key={key} className="rounded-xl p-3"
                            style={{ background: cfg.bg, border:`1px solid ${cfg.border}` }}>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs" style={{ color:'var(--text-label)' }}>{cfg.label}</p>
                                <cfg.icon size={12} style={{ color: cfg.color }}/>
                            </div>
                            <p className="text-xl font-bold" style={{ color: cfg.color }}>{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Timeline */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#818cf8" strokeWidth="4"/>
                        <path className="opacity-75" fill="#818cf8" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <p className="text-sm" style={{ color:'var(--text-muted)' }}>Memuat log...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="rounded-2xl flex flex-col items-center justify-center py-16"
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)' }}>
                    <Activity size={32} style={{ color:'var(--text-muted)', marginBottom:8 }}/>
                    <p className="font-semibold text-sm" style={{ color:'var(--text-secondary)' }}>Tidak ada aktivitas</p>
                    <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>Belum ada data activity log yang cocok</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[22px] top-0 bottom-0 w-px" style={{ background:'var(--border)' }}/>

                    <div className="space-y-2 pl-12">
                        {logs.map((log) => {
                            const ecfg = EVENT_CFG[log.event] || EVENT_CFG.default;
                            const isExp = expanded === log.id;
                            const props = log.properties;
                            const hasProps = props && (props.attributes || props.old);

                            return (
                                <div key={log.id} className="relative">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[34px] top-3.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                                        style={{ background: ecfg.bg, border:`2px solid ${ecfg.border}` }}>
                                        <ecfg.icon size={9} style={{ color: ecfg.color }}/>
                                    </div>

                                    <div className="rounded-xl p-3.5 transition-all duration-200"
                                        style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background='var(--bg-card-hover)'; e.currentTarget.style.borderColor=ecfg.border; }}
                                        onMouseLeave={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.borderColor='var(--border-card)'; }}
                                    >
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Event badge */}
                                                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                                        style={{ background:ecfg.bg, color:ecfg.color, border:`1px solid ${ecfg.border}` }}>
                                                        {ecfg.label}
                                                    </span>
                                                    {/* Subject type */}
                                                    {log.subject_type && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                                                            style={{ background:'rgba(99,102,241,0.1)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)' }}>
                                                            <Database size={8} className="inline mr-0.5"/>{log.subject_type}
                                                            {log.subject_id && <span className="opacity-60"> #{log.subject_id}</span>}
                                                        </span>
                                                    )}
                                                    {/* Log name */}
                                                    {log.log_name && log.log_name !== 'default' && (
                                                        <span className="text-xs" style={{ color:'var(--text-muted)' }}>[{log.log_name}]</span>
                                                    )}
                                                </div>
                                                <p className="text-sm mt-1.5 font-medium" style={{ color:'var(--text-primary)' }}>
                                                    {log.description}
                                                </p>
                                            </div>
                                            {/* Right meta */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-medium" style={{ color:'var(--text-secondary)' }}>{log.causer_name}</p>
                                                <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>
                                                    <Clock size={9} className="inline mr-0.5"/>{fmtDate(log.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Expandable properties */}
                                        {hasProps && (
                                            <div className="mt-2">
                                                <button onClick={() => setExpanded(isExp ? null : log.id)}
                                                    className="text-xs flex items-center gap-1 transition-colors duration-150"
                                                    style={{ color: ecfg.color }}>
                                                    <ChevronDown size={11} style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}/>
                                                    {isExp ? 'Sembunyikan detail' : 'Lihat detail perubahan'}
                                                </button>
                                                {isExp && (
                                                    <div className="mt-2 p-3 rounded-lg text-xs font-mono overflow-x-auto"
                                                        style={{ background:'var(--bg-input)', border:'1px solid var(--border-input)', color:'var(--text-secondary)' }}>
                                                        <pre>{JSON.stringify(props, null, 2)}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Paginasi */}
            {!loading && lastPage > 1 && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)' }}>
                    <span className="text-xs" style={{ color:'var(--text-muted)' }}>
                        Halaman {page} dari {lastPage}
                    </span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                            className="btn-ghost" style={{ opacity: page <= 1 ? 0.4 : 1 }}>
                            Sebelumnya
                        </button>
                        <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page >= lastPage}
                            className="btn-ghost" style={{ opacity: page >= lastPage ? 0.4 : 1 }}>
                            Berikutnya
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════ */
