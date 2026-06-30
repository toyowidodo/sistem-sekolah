import {
    PackageSearch, PlusCircle, Edit, Trash2, Search, ArrowDownToLine, ArrowUpFromLine, 
    CheckCircle, Archive, Monitor, Book, Paperclip, Wrench, ShieldAlert, QrCode, ScanLine, Printer
} from 'lucide-react';
import Swal from 'sweetalert2';



export const swal = (opts) => Swal.fire({ background: '#0d1526', color: '#e2e8f0', ...opts });

export const CAT_CFG = {
    elektronik: { label: 'Elektronik', icon: Monitor, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    furnitur:   { label: 'Furnitur', icon: Archive, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    buku:       { label: 'Buku', icon: Book, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    alat_tulis: { label: 'Alat Tulis', icon: Paperclip, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    lainnya:    { label: 'Lainnya', icon: Wrench, color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};

export const COND_CFG = {
    baik:         { label: 'Baik', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    rusak_ringan: { label: 'Rusak Ringan', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    rusak_berat:  { label: 'Rusak Berat', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export const fmtPrice = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

