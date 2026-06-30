import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react';

const ModernDatepicker = React.forwardRef(({ className, onChange, value, name, onBlur, defaultValue, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const hiddenInputRef = useRef(null);
    
    // localValue is YYYY-MM-DD string
    const [localValue, setLocalValue] = useState(value !== undefined ? value : (defaultValue !== undefined ? defaultValue : ''));
    
    // View state for the calendar
    const [viewDate, setViewDate] = useState(new Date());

    // Input state for typing DD/MM/YYYY
    const [inputValue, setInputValue] = useState('');

    const { refs, floatingStyles } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'bottom',
        middleware: [offset(8), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    useEffect(() => {
        if (value !== undefined) {
            setLocalValue(value);
        }
    }, [value]);

    useEffect(() => {
        if (localValue) {
            const parts = localValue.split('-');
            if (parts.length === 3) {
                setInputValue(`${parts[2]}/${parts[1]}/${parts[0]}`);
                const parsed = new Date(localValue);
                if (!isNaN(parsed)) setViewDate(parsed);
            }
        } else {
            setInputValue('');
        }
    }, [localValue]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (refs.reference.current && !refs.reference.current.contains(event.target) && 
                refs.floating.current && !refs.floating.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [refs]);

    const classList = (className || '').split(' ').filter(Boolean);
    const layoutClasses = classList.filter(c => c.match(/^(w-|m|flex-1|col-)/));
    const styleClasses = classList.filter(c => !c.match(/^(w-|m|flex-1|col-)/));

    const handleSelect = (dateStr) => {
        setLocalValue(dateStr);
        setIsOpen(false);
        
        if (onChange) {
            onChange({ target: { name, value: dateStr }, type: 'change' });
        }
        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = dateStr;
            const nativeEvent = new Event('change', { bubbles: true });
            hiddenInputRef.current.dispatchEvent(nativeEvent);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        
        // Try to parse DD/MM/YYYY or DD-MM-YYYY
        const parts = val.split(/[-/]/);
        if (parts.length === 3) {
            const d = parseInt(parts[0]);
            const m = parseInt(parts[1]);
            const y = parseInt(parts[2]);
            if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1000) {
                const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                setLocalValue(dateStr);
                setViewDate(new Date(y, m - 1, 1));
                
                if (onChange) onChange({ target: { name, value: dateStr }, type: 'change' });
                if (hiddenInputRef.current) {
                    hiddenInputRef.current.value = dateStr;
                    hiddenInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }
    };

    // Calendar logic
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    const renderDays = () => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = localValue === dateStr;
            const isToday = new Date().toISOString().slice(0, 10) === dateStr;

            days.push(
                <button
                    key={d}
                    type="button"
                    onClick={() => handleSelect(dateStr)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${
                        isSelected 
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' 
                        : isToday 
                            ? 'bg-[var(--bg-table-hover)] text-indigo-400 border border-indigo-500/30' 
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-btn-ghost)] hover:text-[var(--text-primary)]'
                    }`}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    return (
        <div className={`relative ${layoutClasses.join(' ')}`} ref={containerRef}>
            <input 
                type="date"
                className="absolute opacity-0 w-0 h-0" 
                name={name} 
                onChange={onChange} 
                onBlur={onBlur} 
                disabled={disabled}
                ref={(e) => {
                    hiddenInputRef.current = e;
                    if (typeof ref === 'function') ref(e);
                    else if (ref) ref.current = e;
                }}
                value={localValue}
                {...props}
            />

            <div
                ref={refs.setReference}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm transition-all duration-200 outline-none ${styleClasses.join(' ')}`}
                style={{
                    background: disabled ? 'rgba(0,0,0,0.02)' : 'var(--bg-input)',
                    border: isOpen ? '1px solid var(--border-input-focus)' : '1px solid var(--border-input)',
                    color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
                    boxShadow: isOpen ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                    opacity: disabled ? 0.6 : 1,
                }}
            >
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => !disabled && setIsOpen(true)}
                    placeholder="DD/MM/YYYY"
                    disabled={disabled}
                    className="bg-transparent border-none outline-none w-full text-[var(--text-primary)] placeholder-[var(--text-ph)]"
                />
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className="ml-2 flex-shrink-0 focus:outline-none"
                >
                    <CalendarIcon size={16} className={isOpen ? 'text-indigo-400' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors'} />
                </button>
            </div>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    <div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 9999 }}>
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="p-4 rounded-2xl shadow-xl w-[280px]"
                        >
                            <div className="absolute inset-0 rounded-2xl" style={{
                                background: 'var(--bg-modal)',
                                border: '1px solid var(--border-modal)',
                                backdropFilter: 'blur(12px)',
                                zIndex: -1
                            }}/>
                        <div className="flex items-center justify-between mb-4">
                            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-btn-ghost)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="font-semibold text-sm text-[var(--text-primary)]">
                                {monthNames[month]} {year}
                            </div>
                            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[var(--bg-btn-ghost)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map(day => (
                                <div key={day} className="w-8 text-center text-[10px] font-bold text-[var(--text-muted)] uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {renderDays()}
                        </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
});

ModernDatepicker.displayName = 'ModernDatepicker';
export default ModernDatepicker;
