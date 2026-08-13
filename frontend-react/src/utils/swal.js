import Swal from 'sweetalert2';

/**
 * Pembungkus SweetAlert yang mengikuti tema aktif.
 *
 * Sebelumnya 49 pemanggilan tersebar di 14 berkas meng-hardcode
 * `background: '#0d1526'` (navy gelap) — akibatnya SETIAP dialog konfirmasi,
 * sukses, dan error tampil sebagai kotak gelap saat tema terang dipakai.
 *
 * Warnanya dibaca dari CSS variable pada saat dipanggil, bukan saat modul
 * dimuat, supaya dialog langsung ikut berubah setelah pengguna menukar tema.
 */
const cssVar = (name, fallback) => {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
};

export const swal = (opts = {}) => Swal.fire({
    background: cssVar('--bg-modal', '#0d1526'),
    color: cssVar('--text-primary', '#e2e8f0'),
    confirmButtonColor: '#6366f1',
    cancelButtonColor: cssVar('--bg-btn-ghost-h', '#374151'),
    ...opts,
});

export default swal;
