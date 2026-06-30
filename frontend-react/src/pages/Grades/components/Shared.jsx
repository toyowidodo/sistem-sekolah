
import { Award, BookOpen, Save, FileText, ChevronDown, RefreshCw, TrendingUp, Star, Medal } from 'lucide-react';
import Swal from 'sweetalert2';


export const swal = (opts) => Swal.fire({ background: '#0d1526', color: '#e2e8f0', ...opts });

export const GRADE_CFG = {
    A: { color: '#34d399', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)',  label: 'Sangat Baik' },
    B: { color: '#60a5fa', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)',  label: 'Baik' },
    C: { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)',  label: 'Cukup' },
    D: { color: '#f97316', bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.3)',  label: 'Kurang' },
    E: { color: '#f87171', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   label: 'Sangat Kurang' },
    '-':{ color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', label: '-' },
};

export const GradeBadge = ({ letter }) => {
    const cfg = GRADE_CFG[letter] || GRADE_CFG['-'];
    return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {letter || '-'}
        </span>
    );
};

export const ScoreInput = ({ value, onChange, placeholder = '0' }) => (
    <input
        type="number" min="0" max="100" step="0.5"
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 rounded-lg text-xs text-center font-mono outline-none transition-all duration-150"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-input)' }}
        onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border-input)'; e.target.style.boxShadow = 'none'; }}
    />
);

export const CURRENT_YEAR = `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;

