import {
    BookOpen, PlusCircle, Edit, Trash2, GraduationCap,
    Calendar, Users, Clock, ChevronDown, School, Hash,
    MapPin, BookMarked
} from 'lucide-react';
import Swal from 'sweetalert2';


export const swal = (opts) => Swal.fire({ background: '#0d1526', color: '#e2e8f0', ...opts });
export const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-1.5';
export const labelStyle = { color: 'var(--text-label)' };

export const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const DAY_COLOR = {
    Senin:  { color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)' },
    Selasa: { color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
    Rabu:   { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
    Kamis:  { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    Jumat:  { color: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)'  },
    Sabtu:  { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
};

export const GRADE_COLOR = {
    X:   'linear-gradient(135deg, #6366f1, #818cf8)',
    XI:  'linear-gradient(135deg, #06b6d4, #67e8f9)',
    XII: 'linear-gradient(135deg, #10b981, #34d399)',
};

/* ── Action Button ── */
export const ActionBtn = ({ bg, color, border, hoverBg, icon, onClick, title }) => (
    <button onClick={onClick} title={title}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
        style={{ background: bg, color, border: `1px solid ${border}` }}
        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
        onMouseLeave={e => e.currentTarget.style.background = bg}
    >{icon}</button>
);

