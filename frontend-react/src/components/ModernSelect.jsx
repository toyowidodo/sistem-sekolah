import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useFloating, autoUpdate, offset, flip, shift, size } from '@floating-ui/react';

const ModernSelect = React.forwardRef(({ children, className, onChange, value, name, onBlur, defaultValue, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const hiddenSelectRef = useRef(null);
    
    // We need local state for the displayed value to reflect changes immediately
    const [localValue, setLocalValue] = useState(value !== undefined ? value : (defaultValue !== undefined ? defaultValue : ''));

    const { refs, floatingStyles } = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        placement: 'bottom-start',
        middleware: [
            offset(8), 
            flip(), 
            shift({ padding: 8 }),
            size({
                apply({ rects, elements }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                    });
                },
            })
        ],
        whileElementsMounted: autoUpdate,
    });

    // Sync if parent changes value
    useEffect(() => {
        if (value !== undefined) {
            setLocalValue(value);
        }
    }, [value]);

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

    const options = React.Children.toArray(children)
        .filter(child => child.type === 'option')
        .map(child => ({
            value: child.props.value,
            label: child.props.children
        }));

    const selectedOption = options.find(opt => String(opt.value) === String(localValue));
    // If no option is selected but we have options, usually the first is default if no placeholder
    // But let's respect placeholder logic by defaulting to the first option if nothing matches and localValue is empty
    const displayLabel = selectedOption ? selectedOption.label : (options.length > 0 && !localValue ? options[0].label : 'Pilih...');

    const handleSelect = (val) => {
        setLocalValue(val);
        setIsOpen(false);
        // Create a synthetic event for react-hook-form or parent onChange
        if (onChange) {
            const event = {
                target: { name, value: val },
                type: 'change'
            };
            onChange(event);
        }
        if (hiddenSelectRef.current) {
             hiddenSelectRef.current.value = val;
             // Dispatch change event so native listeners (like react-hook-form) catch it
             const nativeEvent = new Event('change', { bubbles: true });
             hiddenSelectRef.current.dispatchEvent(nativeEvent);
        }
    };

    const classList = (className || '').split(' ').filter(Boolean);
    const layoutClasses = classList.filter(c => c.match(/^(w-|m|flex-1|col-)/));
    const styleClasses = classList.filter(c => !c.match(/^(w-|m|flex-1|col-)/));

    return (
        <div className={`relative ${layoutClasses.join(' ')}`} ref={containerRef}>
            {/* Hidden native select for react-hook-form ref and form submission */}
            <select 
                className="absolute opacity-0 w-0 h-0" 
                name={name} 
                onChange={onChange} 
                onBlur={onBlur} 
                disabled={disabled}
                ref={(e) => {
                    hiddenSelectRef.current = e;
                    if (typeof ref === 'function') ref(e);
                    else if (ref) ref.current = e;
                }}
                value={localValue}
                {...props}
            >
                {children}
            </select>

            {/* Custom UI */}
            <button
                type="button"
                ref={refs.setReference}
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50 ${styleClasses.join(' ')}`}
                style={{
                    background: disabled ? 'rgba(0,0,0,0.02)' : 'var(--bg-input)',
                    border: isOpen ? '1px solid var(--border-input-focus)' : '1px solid var(--border-input)',
                    color: disabled ? 'var(--text-muted)' : 'var(--text-input)',
                    boxShadow: isOpen ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                    opacity: disabled ? 0.6 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer'
                }}
            >
                <span className="truncate">{displayLabel}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                </motion.div>
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    <div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 9999 }}>
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="rounded-xl shadow-xl"
                        >
                            <div className="absolute inset-0 rounded-xl overflow-hidden" style={{
                                background: 'var(--bg-modal)',
                                border: '1px solid var(--border-modal)',
                                backdropFilter: 'blur(12px)',
                                zIndex: -1
                            }}/>
                        <div className="max-h-60 overflow-y-auto py-1">
                            {options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors duration-150"
                                    style={{
                                        color: localValue === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        background: localValue === opt.value ? 'var(--bg-table-hover)' : 'transparent'
                                    }}
                                    onMouseEnter={e => { if (localValue !== opt.value) e.currentTarget.style.background = 'var(--bg-btn-ghost)'; }}
                                    onMouseLeave={e => { if (localValue !== opt.value) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <span className={localValue === opt.value ? 'font-medium' : ''}>{opt.label}</span>
                                    {localValue === opt.value && <Check size={14} style={{ color: '#6366f1' }} />}
                                </button>
                            ))}
                        </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
});

ModernSelect.displayName = 'ModernSelect';
export default ModernSelect;
