import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, AreaChart, Area
} from 'recharts';
import { Users, GraduationCap, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--bg-modal)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '10px 14px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: 6, fontWeight: 600 }}>{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color, fontSize: '13px', fontWeight: 600 }}>
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
};

export default function Dashboard() {
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: { students: 0, teachers: 0, revenue: { current: 0, change: 0 }, attendance: 0 },
        charts: { revenue: [], attendance: [] }
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setData(res.data);
            } catch (error) {
                console.error("Gagal memuat statistik dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const axisColor = isDark ? 'rgba(148,163,184,0.4)' : '#94a3b8';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
    const legendColor = isDark ? 'rgba(148,163,184,0.7)' : '#64748b';

    const renderChange = (changeVal) => {
        if (changeVal > 0) return <><ArrowUpRight size={13} className="mr-0.5"/> +{changeVal}%</>;
        if (changeVal < 0) return <><ArrowDownRight size={13} className="mr-0.5 text-red-500"/> {changeVal}%</>;
        return <><Activity size={13} className="mr-0.5"/> 0%</>;
    };

    const stats = [
        { title: 'Total Siswa',         value: data.stats.students, change: '+2% bulan ini',    icon: Users,         gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', glow: 'rgba(99,102,241,0.3)',   border: '#6366f1' },
        { title: 'Total Guru',           value: data.stats.teachers,    change: '+0% bulan ini',     icon: GraduationCap, gradient: 'linear-gradient(135deg, #06b6d4, #67e8f9)', glow: 'rgba(6,182,212,0.3)',   border: '#06b6d4' },
        { title: 'SPP Bulan Ini',  value: fmt(data.stats.revenue.current), change: renderChange(data.stats.revenue.change), icon: Wallet,   gradient: 'linear-gradient(135deg, #10b981, #34d399)', glow: 'rgba(16,185,129,0.3)', border: '#10b981' },
        { title: 'Kehadiran Hari Ini',   value: `${data.stats.attendance}%`,   change: data.stats.attendance >= 90 ? 'Tinggi — Normal' : 'Rendah', icon: TrendingUp,    gradient: 'linear-gradient(135deg, #f59e0b, #fcd34d)', glow: 'rgba(245,158,11,0.3)', border: '#f59e0b' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[60vh]">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-medium animate-pulse" style={{ color: 'var(--text-muted)' }}>Memuat Analitik...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Dashboard Analitik</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Ringkasan aktivitas dan kinerja sekolah secara real-time.
                    </p>
                </div>
                <div className="text-right text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2 animate-pulse"></span>
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="relative rounded-2xl p-5 overflow-hidden transition-all duration-300 cursor-default group"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-card)',
                            boxShadow: 'var(--shadow-card)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = `0 15px 30px -10px ${stat.glow}`;
                            e.currentTarget.style.borderColor = stat.border;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                            e.currentTarget.style.borderColor = 'var(--border-card)';
                        }}
                    >
                        {/* Glassmorphism accent line */}
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: stat.gradient, opacity: 0.8 }} />

                        {/* BG glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12"
                            style={{ background: stat.glow, filter: 'blur(40px)', transform: 'translate(40%,-40%)' }} />

                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-label)' }}>
                                    {stat.title}
                                </p>
                                <h3 className="text-2xl font-black mt-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                    {stat.value}
                                </h3>
                                <div className="text-xs mt-2 flex items-center font-medium" style={{ color: 'var(--text-secondary)' }}>
                                    {stat.change}
                                </div>
                            </div>
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                                style={{ background: stat.gradient, boxShadow: `0 8px 16px ${stat.glow}` }}
                            >
                                <stat.icon size={22} className="text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Bar Chart */}
                <div
                    className="lg:col-span-2 rounded-2xl p-6 relative overflow-hidden group"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-card)',
                        boxShadow: 'var(--shadow-card)',
                    }}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-20"></div>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                                Statistik Kehadiran
                            </h2>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>6 hari terakhir operasional sekolah</p>
                        </div>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.charts.attendance} barGap={6}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', color: legendColor, paddingTop: '15px' }} iconType="circle" />
                            <Bar dataKey="Hadir" fill="url(#colorHadir)" radius={[6,6,0,0]} maxBarSize={32} />
                            <Bar dataKey="Absen"  fill="url(#colorAbsen)" radius={[6,6,0,0]} maxBarSize={32} />
                            <defs>
                                <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8}/>
                                </linearGradient>
                                <linearGradient id="colorAbsen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#fb7185" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Area Chart */}
                <div
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-card)',
                        boxShadow: 'var(--shadow-card)',
                    }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                            style={{ background: 'rgba(16,185,129,0.1)', filter: 'blur(40px)', transform: 'translate(30%,-30%)' }} />
                            
                    <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        Trend SPP
                    </h2>
                    <p className="text-xs mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>Pemasukan dlm jutaan rupiah (6 bulan)</p>
                    
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={data.charts.revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="value" name="Pemasukan (jt)"
                                stroke="#10b981" strokeWidth={3} fill="url(#colorRevenue)" 
                                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}