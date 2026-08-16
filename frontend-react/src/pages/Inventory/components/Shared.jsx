import {
    PackageSearch, PlusCircle, Edit, Trash2, Search, ArrowDownToLine, ArrowUpFromLine, 
    CheckCircle, Archive, Monitor, Book, Paperclip, Wrench, ShieldAlert, QrCode, ScanLine, Printer
} from 'lucide-react';



export { swal } from '../../../utils/swal';

export const CAT_CFG = {
    elektronik: { label: 'Elektronik', icon: Monitor, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    furnitur:   { label: 'Furnitur', icon: Archive, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    buku:       { label: 'Buku', icon: Book, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    alat_tulis: { label: 'Alat Tulis', icon: Paperclip, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    lainnya:    { label: 'Lainnya', icon: Wrench, color: '#64748b', bg: 'rgba(100,116,139,0.1)' }
};

/**
 * `color` dipakai pada badge yang punya latar tint, jadi boleh cerah.
 * `text` untuk teks polos di atas kartu atau modal — di sana warna badge tidak
 * cukup kontras pada tema terang, jadi dipakai variabel yang menyesuaikan tema.
 */
export const COND_CFG = {
    baik:         { label: 'Baik', color: '#10b981', bg: 'rgba(16,185,129,0.1)', text: 'var(--status-ok)' },
    rusak_ringan: { label: 'Rusak Ringan', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: 'var(--status-warn)' },
    rusak_berat:  { label: 'Rusak Berat', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: 'var(--status-bad)' }
};

export const fmtPrice = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

/**
 * Laravel mengirim tanggal sebagai ISO tengah malam UTC ("2025-03-14T00:00:00Z").
 * Menyerahkannya ke new Date() membuat tanggal tergeser mundur sehari di zona
 * waktu barat UTC, jadi komponennya diurai langsung dan dibangun sebagai
 * tanggal lokal — hasilnya sama di zona waktu mana pun.
 */
export const fmtDate = (d) => {
    if (!d) return null;
    const [y, m, day] = String(d).slice(0, 10).split('-').map(Number);
    if (!y || !m || !day) return null;
    return new Date(y, m - 1, day)
        .toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * SweetAlert menyisipkan opsi `html` apa adanya lewat innerHTML — tidak ada
 * penyaringan bawaan. Nama barang dan lokasi berasal dari input pengguna, jadi
 * keduanya harus dilewatkan ke sini sebelum ikut dirangkai jadi markup.
 */
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

