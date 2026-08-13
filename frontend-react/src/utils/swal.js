import Swal from 'sweetalert2';

/**
 * Pembungkus SweetAlert yang mengikuti tema aktif.
 *
 * Sebelumnya 49 pemanggilan tersebar di 14 berkas meng-hardcode
 * `background: '#0d1526'` (navy gelap) — akibatnya SETIAP dialog konfirmasi,
 * sukses, dan error tampil sebagai kotak gelap saat tema terang dipakai.
 *
 * background & color memakai var() langsung, bukan nilai yang dibaca sekali.
 * SweetAlert menempelkannya sebagai inline style, dan browser menyelesaikan
 * custom property dari :root — jadi dialog yang sedang terbuka pun ikut
 * berubah saat tema ditukar, tanpa perlu dibuka ulang.
 */
export const swal = (opts = {}) => Swal.fire({
    background: 'var(--bg-modal)',
    color: 'var(--text-primary)',

    // Warna tombol harus nilai konkret: SweetAlert menurunkan warna bayangan
    // fokus dari nilai ini, dan turunan itu tidak bisa dihitung dari var().
    //
    // Jangan pakai --bg-btn-ghost-h di sini. Nilainya rgba(0,0,0,0.07) —
    // tint hover yang nyaris transparan, bukan warna isi tombol. Dipakai
    // sebagai latar tombol, teks putih di atasnya hanya berkontras 1.20:1
    // di tema terang alias tombol Batal jadi tak terlihat.
    //
    // Slate-500 terbaca di kedua tema: putih di atasnya 4.76:1.
    // Indigo-600 dipilih ketimbang indigo-500 karena yang terakhir hanya
    // 4.47:1 dengan teks putih — tepat di bawah ambang AA.
    confirmButtonColor: '#4f46e5',  // 6.29:1
    cancelButtonColor: '#64748b',   // 4.76:1

    ...opts,
});

export default swal;
