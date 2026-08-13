import { Link } from 'react-router-dom';
import { Inbox, ArrowRight } from 'lucide-react';

/**
 * Tampilan untuk data yang masih kosong.
 *
 * Sebelumnya setiap tabel kosong hanya menulis "Tidak ada data" — pengguna baru
 * tidak tahu apakah itu wajar atau ada langkah yang terlewat. Komponen ini
 * menyebutkan penyebabnya dan menautkan langsung ke menu yang harus diisi
 * lebih dulu.
 *
 * @param {string}  title    Kalimat singkat kondisinya
 * @param {string}  hint     Penjelasan apa yang harus dilakukan
 * @param {object}  action   { label, to } tautan internal, atau
 * @param {object}  onAction { label, onClick } tombol aksi langsung
 */
export default function EmptyState({ icon: Icon = Inbox, title, hint, action, onAction, compact = false }) {
    return (
        <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-10' : 'py-16'} px-6`}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Icon size={24} style={{ color: '#818cf8' }} />
            </div>

            <p className="font-semibold text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {title}
            </p>

            {hint && (
                <p className="text-xs max-w-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {hint}
                </p>
            )}

            {action && (
                <Link to={action.to} className="btn-primary mt-4 inline-flex">
                    {action.label} <ArrowRight size={13} />
                </Link>
            )}

            {onAction && (
                <button onClick={onAction.onClick} className="btn-primary mt-4 inline-flex">
                    {onAction.label} <ArrowRight size={13} />
                </button>
            )}
        </div>
    );
}
