/**
 * Placeholder yang ditampilkan guard rute selagi data user (role & permission)
 * masih diambil dari server. Tanpa ini, guard mengevaluasi permission saat `user`
 * masih null dan langsung melempar user ke dashboard setiap kali refresh halaman.
 */
export default function AccessLoading() {
    return (
        <div className="p-10 flex justify-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat akses...</p>
        </div>
    );
}
