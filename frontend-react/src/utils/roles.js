/**
 * Helper role, disamakan dengan aturan di backend (User::isSchoolAdmin dan
 * App\Services\TeachingScope). Admin sekolah bebas ke seluruh data; guru
 * dibatasi ke kelas & mapel yang diampu atau diwalikan.
 */

export const isSchoolAdmin = (user) =>
    !!(user?.roles?.includes('Superadmin') || user?.roles?.includes('Admin Sekolah'));

export const isGuru = (user) =>
    !!user?.roles?.includes('Guru') && !isSchoolAdmin(user);

export const isSiswa = (user) =>
    !!user?.roles?.includes('Siswa');

export const isOrangTua = (user) =>
    !!user?.roles?.includes('Orang Tua');
