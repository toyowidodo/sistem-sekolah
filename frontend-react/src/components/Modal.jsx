import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl animate-slide-up"
                style={{
                    background: 'var(--bg-modal)',
                    border: '1px solid var(--border-modal)',
                    boxShadow: 'var(--shadow-modal)',
                }}
            >
                {/* Top gradient line */}
                <div
                    className="h-px mx-6 flex-shrink-0"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(6,182,212,0.7), transparent)' }}
                />

                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                    style={{ borderBottom: '1px solid var(--border)' }}
                >
                    <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        id="modal-close-btn"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ color: 'var(--text-muted)', background: 'transparent' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--bg-btn-ghost-h)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}