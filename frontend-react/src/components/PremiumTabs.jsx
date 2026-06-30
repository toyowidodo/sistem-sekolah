import { useState, useId } from 'react';
import { motion } from 'framer-motion';

export default function PremiumTabs({ tabs, activeTab, setActiveTab, colorFrom, colorTo, shadowColor }) {
    const [hoveredTab, setHoveredTab] = useState(null);
    const layoutIdPrefix = useId();

    return (
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit flex-wrap relative z-0"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}
            onMouseLeave={() => setHoveredTab(null)}>
            {tabs.map(t => {
                const isActive = activeTab === t.id;
                const isHovered = hoveredTab === t.id;

                return (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        onMouseEnter={() => setHoveredTab(t.id)}
                        className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-200"
                        style={{
                            color: isActive ? '#fff' : (isHovered ? 'var(--text-primary)' : 'var(--text-secondary)'),
                        }}
                    >
                        {isHovered && !isActive && (
                            <motion.div
                                layoutId={`${layoutIdPrefix}-hoverBg`}
                                className="absolute inset-0 rounded-lg"
                                style={{ background: 'var(--bg-btn-ghost-h)' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {isActive && (
                            <motion.div
                                layoutId={`${layoutIdPrefix}-activeBg`}
                                className="absolute inset-0 rounded-lg"
                                style={{
                                    background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
                                    boxShadow: `0 2px 8px ${shadowColor}`
                                }}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        
                        <span className="relative z-10 flex items-center gap-1.5">
                            {t.icon && <t.icon size={13} />}
                            {t.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
