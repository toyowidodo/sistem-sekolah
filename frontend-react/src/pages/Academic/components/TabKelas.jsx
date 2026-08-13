import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import Modal from '../../../components/Modal';
import { PlusCircle, Edit, Trash2, GraduationCap, Users, School, Hash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { swal, labelClass, labelStyle, GRADE_COLOR, ActionBtn } from './Shared';
import ModernSelect from '../../../components/ModernSelect';

export default function TabKelas({ teachers }) {
    const [classrooms, setClassrooms] = useState([]);
    const [isOpen, setIsOpen]         = useState(false);
    const [editId, setEditId]         = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetch = async () => {
        try { const r = await api.get('/classrooms'); setClassrooms(r.data.data || []); }
        catch { swal({ title: 'Error', text: 'Gagal memuat kelas', icon: 'error' }); }
    };
    useEffect(() => { fetch(); }, []);

    // Default tingkat mengikuti data yang sudah ada, bukan 'X' — sekolah ini
    // belum tentu SMA
    const openCreate = () => {
        reset({ name:'', grade_level: classrooms[0]?.grade_level || '1', major:'', homeroom_teacher_id:'', capacity:30 });
        setEditId(null); setIsOpen(true);
    };
    const openEdit   = (c) => { reset(c); setEditId(c.id); setIsOpen(true); };

    /* ── Generate kelas massal ── */
    const [genOpen, setGenOpen]   = useState(false);
    const [jenjang, setJenjang]   = useState('SD');
    const [rombelCount, setRombel] = useState(2);
    const [kapasitas, setKapasitas] = useState(30);
    const [generating, setGenerating] = useState(false);

    const JENJANG = {
        SD:  ['1', '2', '3', '4', '5', '6'],
        SMP: ['VII', 'VIII', 'IX'],
        SMA: ['X', 'XI', 'XII'],
    };

    const hurufRombel = (n) => Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
    const previewKelas = JENJANG[jenjang].flatMap(t => hurufRombel(rombelCount).map(r => t + r));
    const sudahAda = new Set(classrooms.map(c => c.name.toLowerCase()));
    const bakalBaru = previewKelas.filter(n => !sudahAda.has(n.toLowerCase()));

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const r = await api.post('/classrooms/generate', {
                grade_levels: JENJANG[jenjang],
                rombel: hurufRombel(rombelCount),
                capacity: Number(kapasitas) || 30,
            });
            swal({ title: 'Selesai', text: r.data.message, icon: 'success' });
            setGenOpen(false);
            fetch();
        } catch (e) {
            swal({ title: 'Gagal', text: e.response?.data?.message || 'Terjadi kesalahan', icon: 'error' });
        } finally {
            setGenerating(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            editId ? await api.put(`/classrooms/${editId}`, data) : await api.post('/classrooms', data);
            swal({ title:'Sukses!', text: editId ? 'Kelas diperbarui.' : 'Kelas berhasil dibuat.', icon:'success', timer:1500, showConfirmButton:false });
            setIsOpen(false); fetch();
        } catch (e) { swal({ title:'Error', text: e.response?.data?.message || 'Terjadi kesalahan', icon:'error' }); }
    };

    const handleDelete = (id) => swal({
        title:'Hapus kelas?', text:'Data tidak bisa dikembalikan!', icon:'warning',
        showCancelButton:true, confirmButtonColor:'#ef4444',
        confirmButtonText:'Ya, Hapus!', cancelButtonText:'Batal',
    }).then(async r => { if (r.isConfirmed) { await api.delete(`/classrooms/${id}`); fetch(); } });

    /**
     * Tingkat diambil dari data, bukan didaftar tetap.
     *
     * Sebelumnya nilainya di-hardcode ['X','XI','XII'], sehingga kelas di luar
     * jenjang SMA — misalnya "1A" di SD — tidak pernah dirender. Lebih buruk
     * lagi, empty state hanya muncul kalau classrooms.length === 0, jadi
     * halamannya tampak kosong melompong padahal datanya ada.
     *
     * Urutannya: tingkat angka (1..6) menaik lebih dulu, lalu sisanya
     * mengikuti urutan jenjang yang lazim, baru abjad.
     */
    const ROMAWI = ['VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const grades = [...new Set(classrooms.map(c => c.grade_level).filter(Boolean))]
        .sort((a, b) => {
            const na = Number(a), nb = Number(b);
            if (!isNaN(na) && !isNaN(nb)) return na - nb;
            if (!isNaN(na)) return -1;
            if (!isNaN(nb)) return 1;
            const ia = ROMAWI.indexOf(a), ib = ROMAWI.indexOf(b);
            if (ia !== -1 && ib !== -1) return ia - ib;
            if (ia !== -1) return -1;
            if (ib !== -1) return 1;
            return a.localeCompare(b);
        });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{classrooms.length} kelas terdaftar</p>
                <div className="flex items-center gap-2">
                    <button onClick={() => setGenOpen(true)} className="btn-ghost"><Hash size={13}/> Generate Kelas</button>
                    <button onClick={openCreate} className="btn-primary"><PlusCircle size={13}/> Tambah Kelas</button>
                </div>
            </div>

            {/* Group by grade */}
            {grades.map(grade => {
                const cls = classrooms.filter(c => c.grade_level === grade);
                if (!cls.length) return null;
                return (
                    <div key={grade}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-3 py-0.5 rounded-full text-xs font-bold text-white"
                                style={{ background: GRADE_COLOR[grade] || 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                                Kelas {grade}
                            </div>
                            <div className="flex-1 h-px" style={{ background: 'var(--border)' }}/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {cls.map(c => (
                                <div key={c.id} className="rounded-xl p-4 transition-all duration-200"
                                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)', boxShadow:'var(--shadow-card)' }}
                                    onMouseEnter={e => { e.currentTarget.style.background='var(--bg-card-hover)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.transform='translateY(0)'; }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                                style={{ background: GRADE_COLOR[c.grade_level] || 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                                                {c.grade_level}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm" style={{ color:'var(--text-primary)' }}>{c.name}</p>
                                                {c.major && <p className="text-xs" style={{ color:'var(--text-muted)' }}>{c.major}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ActionBtn bg="rgba(99,102,241,0.1)" color="#818cf8" border="rgba(99,102,241,0.2)" hoverBg="rgba(99,102,241,0.22)" icon={<Edit size={12}/>} onClick={() => openEdit(c)} title="Edit"/>
                                            <ActionBtn bg="rgba(239,68,68,0.1)" color="#f87171" border="rgba(239,68,68,0.2)" hoverBg="rgba(239,68,68,0.22)" icon={<Trash2 size={12}/>} onClick={() => handleDelete(c.id)} title="Hapus"/>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-3 text-xs" style={{ color:'var(--text-muted)' }}>
                                        <span className="flex items-center gap-1"><Users size={10}/> {c.capacity} siswa</span>
                                        {c.homeroom_teacher && <span className="flex items-center gap-1"><GraduationCap size={10}/> {c.homeroom_teacher.name}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {classrooms.length === 0 && (
                <div className="rounded-2xl flex flex-col items-center justify-center py-16"
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-card)' }}>
                    <School size={32} style={{ color:'var(--text-muted)', marginBottom:8 }}/>
                    <p className="font-semibold text-sm" style={{ color:'var(--text-secondary)' }}>Belum ada kelas</p>
                    <p className="text-xs mt-1 max-w-sm text-center" style={{ color:'var(--text-muted)' }}>
                        Kelas harus dibuat lebih dulu — siswa tidak bisa ditempatkan, dan absensi
                        maupun nilai belum bisa dimulai tanpa ini.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => setGenOpen(true)} className="btn-primary"><Hash size={12}/> Generate Sekaligus</button>
                        <button onClick={openCreate} className="btn-ghost"><PlusCircle size={12}/> Tambah Satu</button>
                    </div>
                </div>
            )}

            {/* Modal generate kelas massal */}
            <Modal isOpen={genOpen} onClose={() => setGenOpen(false)} title="Generate Kelas Sekaligus">
                <div className="space-y-4">
                    <div>
                        <label className={labelClass} style={labelStyle}>Jenjang</label>
                        <div className="flex gap-2">
                            {Object.keys(JENJANG).map(j => (
                                <button key={j} type="button" onClick={() => setJenjang(j)}
                                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                                    style={jenjang === j
                                        ? { background:'linear-gradient(135deg,#6366f1,#06b6d4)', color:'#fff' }
                                        : { background:'var(--bg-input)', color:'var(--text-secondary)', border:'1px solid var(--border-input)' }}>
                                    {j}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs mt-1.5" style={{ color:'var(--text-muted)' }}>
                            Tingkat: {JENJANG[jenjang].join(', ')}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Rombel per tingkat</label>
                            <ModernSelect value={rombelCount} onChange={e => setRombel(Number(e.target.value))} className="input-dark w-full">
                                {[1,2,3,4,5,6].map(n => (
                                    <option key={n} value={n}>{n} ({hurufRombel(n).join(', ')})</option>
                                ))}
                            </ModernSelect>
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Kapasitas per kelas</label>
                            <input type="number" min="1" max="100" value={kapasitas}
                                onChange={e => setKapasitas(e.target.value)} className="input-dark w-full"/>
                        </div>
                    </div>

                    <div className="rounded-xl p-3" style={{ background:'var(--bg-input)', border:'1px solid var(--border-input)' }}>
                        <p className="text-xs font-semibold mb-2" style={{ color:'var(--text-label)' }}>
                            Pratinjau — {previewKelas.length} kelas, {bakalBaru.length} akan dibuat
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {previewKelas.map(n => {
                                const ada = sudahAda.has(n.toLowerCase());
                                return (
                                    <span key={n} className="px-2 py-0.5 rounded text-xs font-mono"
                                        style={ada
                                            ? { background:'rgba(100,116,139,0.15)', color:'var(--text-muted)', textDecoration:'line-through' }
                                            : { background:'rgba(99,102,241,0.12)', color:'#818cf8' }}>
                                        {n}
                                    </span>
                                );
                            })}
                        </div>
                        {previewKelas.length !== bakalBaru.length && (
                            <p className="text-xs mt-2" style={{ color:'var(--text-muted)' }}>
                                Yang dicoret sudah ada dan akan dilewati, bukan digandakan.
                            </p>
                        )}
                    </div>

                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>
                        Wali kelas dan jurusan bisa diisi belakangan lewat tombol Edit di tiap kelas.
                    </p>

                    <div className="flex justify-end gap-2 pt-3" style={{ borderTop:'1px solid var(--border)' }}>
                        <button type="button" onClick={() => setGenOpen(false)} className="btn-ghost">Batal</button>
                        <button type="button" onClick={handleGenerate} disabled={generating || bakalBaru.length === 0}
                            className="btn-primary" style={{ opacity: (generating || bakalBaru.length === 0) ? 0.5 : 1 }}>
                            {generating ? 'Membuat...' : `Buat ${bakalBaru.length} Kelas`}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Edit Kelas' : 'Tambah Kelas Baru'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Nama Kelas</label>
                            <input {...register('name',{required:true})} className="input-dark" placeholder="X IPA 1"/>
                            {errors.name && <span className="text-xs mt-1 block" style={{color:'#f87171'}}>Wajib diisi</span>}
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Tingkat</label>
                            <ModernSelect {...register('grade_level',{required:true})} className="input-dark">
                                {['X','XI','XII'].map(g => <option key={g} value={g}>Kelas {g}</option>)}
                            </ModernSelect>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} style={labelStyle}>Jurusan</label>
                            <input {...register('major')} className="input-dark" placeholder="IPA, IPS, dll"/>
                        </div>
                        <div>
                            <label className={labelClass} style={labelStyle}>Kapasitas</label>
                            <input type="number" {...register('capacity')} className="input-dark" defaultValue={30} min={1}/>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Wali Kelas</label>
                        <ModernSelect {...register('homeroom_teacher_id')} className="input-dark">
                            <option value="">--- Pilih Wali Kelas ---</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </ModernSelect>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop:'1px solid var(--border)' }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

