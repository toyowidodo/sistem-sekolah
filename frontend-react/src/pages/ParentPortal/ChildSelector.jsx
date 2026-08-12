import { useEffect } from 'react';
import { useChildStore } from '../../store/childStore';
import ModernSelect from '../../components/ModernSelect';
import { Users } from 'lucide-react';

/**
 * Pemilih anak untuk orang tua yang punya lebih dari satu anak di sekolah.
 * Disembunyikan kalau anaknya cuma satu, supaya tidak jadi kontrol yang sia-sia.
 */
export default function ChildSelector() {
    const { children, selectedId, selectChild, fetchChildren } = useChildStore();

    useEffect(() => { fetchChildren(); }, [fetchChildren]);

    if (children.length <= 1) return null;

    return (
        <div className="flex items-center gap-2">
            <Users size={14} style={{ color: 'var(--text-muted)' }} />
            <ModernSelect
                value={selectedId}
                onChange={e => selectChild(e.target.value)}
                className="input-dark text-sm">
                {children.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name}{c.classroom_name ? ` — ${c.classroom_name}` : ''}
                    </option>
                ))}
            </ModernSelect>
        </div>
    );
}
