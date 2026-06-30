import { useEffect, useState, useCallback } from 'react';
import api from '../../../api/axios';
import Modal from '../../../components/Modal';
import {
    Shield, Users, Activity, PlusCircle, Edit, Trash2,
    Search, RefreshCw, Key, Clock, Database, User,
    ChevronDown, CheckCircle, XCircle, Zap, AlertTriangle, ToggleRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';

export const swal = (opts) => Swal.fire({ background: '#0d1526', color: '#e2e8f0', ...opts });
export const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-1.5';
export const labelStyle = { color: 'var(--text-label)' };

export const ROLE_CFG = {
    'Superadmin':     { color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   icon: Shield },
    'Admin Sekolah':  { color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  icon: Users },
    'Guru':           { color: '#34d399', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  icon: User },
    'Tata Usaha':     { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  icon: User },
    'Bendahara':      { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  icon: User },
    'Siswa':          { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.25)',  icon: User },
    'Orang Tua':      { color: '#67e8f9', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.25)',   icon: User },
};

export const EVENT_CFG = {
    created: { color: '#34d399', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.2)',  icon: PlusCircle, label: 'Dibuat' },
    updated: { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.2)',  icon: Edit,       label: 'Diubah' },
    deleted: { color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.2)',   icon: Trash2,     label: 'Dihapus' },
    default: { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.2)', icon: Zap,        label: 'Aktivitas' },
};

export const fmtDate = (d) => d ? new Date(d).toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-';

export const ActionBtn = ({ bg, color, border, hoverBg, icon, onClick, title }) => (
    <button onClick={onClick} title={title}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
        style={{ background: bg, color, border: `1px solid ${border}` }}
        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
        onMouseLeave={e => e.currentTarget.style.background = bg}
    >{icon}</button>
);
