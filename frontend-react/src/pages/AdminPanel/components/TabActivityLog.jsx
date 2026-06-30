import { useEffect, useState, useCallback } from 'react';
import api from '../../../api/axios';
import Modal from '../../../components/Modal';
import {
    Shield, Users, Activity, PlusCircle, Edit, Trash2,
    Search, RefreshCw, Key, Clock, Database, User,
    ChevronDown, CheckCircle, XCircle, Zap, AlertTriangle, ToggleRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { swal, labelClass, labelStyle, ROLE_CFG, EVENT_CFG, fmtDate, ActionBtn } from './Shared';
import ModernDatepicker from '../../../components/ModernDatepicker';

export default function TabActivityLog() {
    const [logs, setLogs]       = useState([]);
    const [total, setTotal]     = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch]   = useState('');
    const [dateFilter, setDate] = useState('');
    const [expanded, setExpanded] = useState(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (dateFilter) params.set('date', dateFilter);
            const r = await api.get(`/activity-logs?${params}`);
            setLogs(r.data.data || []);
            setTotal(r.data.total || 0);
        } catch { swal({ title:'Error', text:'Gagal memuat activity log', icon:'error' }); }
        finally { setLoading(false); }
    }, [search, dateFilter]);

    useEffect(() => { fetch(); }, [fetch]);

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:'var(--text-muted)' }}/>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari aktivitas atau deskripsi..." className="input-dark pl-9 text-sm w-full"/>
                </div>
                <ModernDatepicker  value={dateFilter} onChange={e => setDate(e.target.value)} className="input-dark text-sm w-36"/>
                {dateFilter && <button onClick={() => setDate('')} className="btn-ghost">Reset</button>}
                <button onClick={fetch} className="btn-ghost"><RefreshCw size={13}/> Refresh</button>
                <span className="text-xs" style={{ color:'var(--text-muted)' }}>{total} aktivitas</span>
            </div>

            {/* Stats row */}
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
                        {logs.map((log, i) => {
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
        </div>
    );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMPONENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
