import { useCallback, useEffect, useState } from 'react';
import api from '../../../api/axios';
import { swal, labelClass, labelStyle } from './Shared';
import {
    MessageSquare, Save, Send, RefreshCw, AlertTriangle,
    CheckCircle, XCircle, MinusCircle, Info
} from 'lucide-react';

const STATUS_CFG = {
    terkirim: { label: 'Terkirim', icon: CheckCircle, color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    gagal:    { label: 'Gagal',    icon: XCircle,     color: '#f87171', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)' },
    dilewati: { label: 'Dilewati', icon: MinusCircle, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
};

export default function TabNotifikasi() {
    const [templates, setTemplates] = useState([]);
    const [meta, setMeta] = useState({});
    const [logs, setLogs] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('Tes notifikasi dari sistem sekolah.');
    const [sending, setSending] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [t, l] = await Promise.all([
                api.get('/notifications/templates'),
                api.get('/notifications/logs', { params: { per_page: 20 } }),
            ]);
            setTemplates(t.data.data || []);
            setMeta({
                driver: t.data.driver,
                gatewayConfigured: t.data.gateway_configured,
                redirectAllTo: t.data.redirect_all_to,
            });
            setDrafts(Object.fromEntries((t.data.data || []).map(x => [x.id, { body: x.body, is_active: x.is_active }])));
            setLogs(l.data.data || []);
        } catch {
            swal({ title: 'Error', text: 'Gagal memuat data notifikasi', icon: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const saveTemplate = async (t) => {
        const draft = drafts[t.id];
        try {
            await api.put(`/notifications/templates/${t.id}`, {
                name: t.name,
                body: draft.body,
                is_active: draft.is_active,
            });
            swal({ title: 'Tersimpan', icon: 'success', timer: 1400, showConfirmButton: false });
            load();
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal menyimpan', icon: 'error' });
        }
    };

    const sendTest = async () => {
        if (!testPhone.trim()) {
            swal({ title: 'Nomor kosong', text: 'Isi nomor tujuan lebih dulu.', icon: 'warning' });
            return;
        }
        setSending(true);
        try {
            const res = await api.post('/notifications/test', { phone: testPhone, message: testMessage });
            swal({ title: 'Hasil Uji Coba', text: res.data.message, icon: res.data.data.status === 'terkirim' ? 'success' : 'info' });
            load();
        } catch (e) {
            swal({ title: 'Error', text: e.response?.data?.message || 'Gagal mengirim', icon: 'error' });
        } finally {
            setSending(false);
        }
    };

    const insertPlaceholder = (id, ph) => {
        setDrafts(d => ({ ...d, [id]: { ...d[id], body: d[id].body + `{${ph}}` } }));
    };

    const isLogDriver = meta.driver === 'log';

    return (
        <div className="space-y-4">
            {/* Status driver */}
            <div className="rounded-xl px-4 py-3 flex items-start gap-3"
                style={isLogDriver
                    ? { background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }
                    : { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                {isLogDriver ? <AlertTriangle size={15} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
                    : <CheckCircle size={15} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />}
                <div className="text-xs" style={{ color: isLogDriver ? '#fbbf24' : '#34d399' }}>
                    {isLogDriver ? (
                        <>
                            <strong>Mode aman aktif (driver: log).</strong> Tidak ada pesan yang benar-benar dikirim —
                            semuanya hanya dicatat di log. Untuk mengaktifkan pengiriman sungguhan, isi
                            <code className="mx-1 px-1 rounded" style={{ background: 'rgba(0,0,0,0.25)' }}>NOTIFICATION_DRIVER=http</code>
                            beserta URL dan token gateway di file <code>.env</code>.
                        </>
                    ) : (
                        <>
                            <strong>Driver aktif: {meta.driver}.</strong>{' '}
                            {meta.gatewayConfigured ? 'Gateway sudah dikonfigurasi.' : 'Peringatan: URL gateway belum diisi di .env.'}
                        </>
                    )}
                    {meta.redirectAllTo && (
                        <div className="mt-1">
                            Semua notifikasi dialihkan ke <strong>{meta.redirectAllTo}</strong> (mode uji coba).
                        </div>
                    )}
                </div>
            </div>

            {/* Template */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat...</p>
                ) : templates.map(t => (
                    <div key={t.id} className="rounded-2xl p-5"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={16} style={{ color: '#818cf8' }} />
                                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</h3>
                                <code className="text-xs px-1.5 py-0.5 rounded"
                                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>{t.key}</code>
                            </div>
                            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                                <input type="checkbox" checked={drafts[t.id]?.is_active ?? false}
                                    onChange={e => setDrafts(d => ({ ...d, [t.id]: { ...d[t.id], is_active: e.target.checked } }))} />
                                Aktif
                            </label>
                        </div>

                        <textarea
                            value={drafts[t.id]?.body ?? ''}
                            onChange={e => setDrafts(d => ({ ...d, [t.id]: { ...d[t.id], body: e.target.value } }))}
                            rows={7}
                            className="input-dark w-full resize-y font-mono text-xs" />

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                <Info size={11} /> Sisipkan:
                            </span>
                            {t.placeholders.map(ph => (
                                <button key={ph} type="button" onClick={() => insertPlaceholder(t.id, ph)}
                                    className="text-xs font-mono px-2 py-0.5 rounded-lg"
                                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                                    {`{${ph}}`}
                                </button>
                            ))}
                            <button onClick={() => saveTemplate(t)} className="btn-primary ml-auto">
                                <Save size={13} /> Simpan
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Uji coba */}
            <div className="rounded-2xl p-5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Kirim Uji Coba</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                    <div>
                        <label className={labelClass} style={labelStyle}>Nomor Tujuan</label>
                        <input value={testPhone} onChange={e => setTestPhone(e.target.value)}
                            className="input-dark w-full" placeholder="08xxxxxxxxxx" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelClass} style={labelStyle}>Isi Pesan</label>
                        <input value={testMessage} onChange={e => setTestMessage(e.target.value)} className="input-dark w-full" />
                    </div>
                </div>
                <div className="flex justify-end mt-3">
                    <button onClick={sendTest} disabled={sending} className="btn-primary">
                        <Send size={13} /> {sending ? 'Mengirim...' : 'Kirim Uji Coba'}
                    </button>
                </div>
            </div>

            {/* Log */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Riwayat Pengiriman</h3>
                    <button onClick={load} className="btn-ghost"><RefreshCw size={13} /> Refresh</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-table-head)' }}>
                                {['Waktu', 'Penerima', 'Nomor', 'Jenis', 'Status', 'Keterangan'].map((h, i) => (
                                    <th key={i} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: 'var(--text-th)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr><td colSpan={6} className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                                    Belum ada riwayat pengiriman
                                </td></tr>
                            ) : logs.map((l, i) => {
                                const cfg = STATUS_CFG[l.status] || STATUS_CFG.dilewati;
                                return (
                                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent' }}>
                                        <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                                            {new Date(l.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-primary)' }}>
                                            {l.recipient_name || '-'}
                                            {l.student?.name && (
                                                <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    siswa: {l.student.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{l.recipient_phone}</td>
                                        <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{l.template_key || 'manual'}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                                                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                                <cfg.icon size={10} /> {cfg.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-xs max-w-[240px] truncate" style={{ color: 'var(--text-muted)' }} title={l.error || ''}>
                                            {l.error || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
