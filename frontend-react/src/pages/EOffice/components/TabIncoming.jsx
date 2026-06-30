import { useState, useEffect } from 'react';
import api, { baseURL } from '../../../api/axios';
import { Search, PlusCircle, RefreshCw, FileText, Download, Edit, Trash2, Calendar, User, Eye } from 'lucide-react';
import Modal from '../../../components/Modal';
import ModernDatepicker from '../../../components/ModernDatepicker';

export default function TabIncoming() {
    const [mails, setMails] = useState([]);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        reference_number: '',
        entity: '',
        subject: '',
        date: '',
        received_date: '',
        disposition: '',
        file: null
    });

    const fetchMails = async () => {
        try {
            const res = await api.get('/mails?type=incoming');
            setMails(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchMails(); }, []);

    const filtered = mails.filter(m => 
        m.reference_number.toLowerCase().includes(search.toLowerCase()) || 
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.entity.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setFormData({ reference_number: '', entity: '', subject: '', date: '', received_date: '', disposition: '', file: null });
        setEditId(null);
        setIsOpen(true);
    };

    const openEdit = (m) => {
        setFormData({
            reference_number: m.reference_number,
            entity: m.entity,
            subject: m.subject,
            date: m.date,
            received_date: m.received_date || '',
            disposition: m.disposition || '',
            file: null
        });
        setEditId(m.id);
        setIsOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus arsip surat ini?')) return;
        try {
            await api.delete(`/mails/${id}`);
            fetchMails();
        } catch (err) {
            alert('Gagal menghapus');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('type', 'incoming');
        fd.append('reference_number', formData.reference_number);
        fd.append('entity', formData.entity);
        fd.append('subject', formData.subject);
        fd.append('date', formData.date);
        if (formData.received_date) fd.append('received_date', formData.received_date);
        if (formData.disposition) fd.append('disposition', formData.disposition);
        if (formData.file) fd.append('file', formData.file);

        try {
            if (editId) {
                // Laravel spoofing for PUT with FormData
                fd.append('_method', 'PUT');
                await api.post(`/mails/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
            } else {
                await api.post('/mails', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
            }
            setIsOpen(false);
            fetchMails();
        } catch (err) {
            alert(err.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"/>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Cari No. Surat, Pengirim, atau Perihal..." className="input-dark pl-9 text-sm w-full"/>
                </div>
                <button onClick={fetchMails} className="btn-ghost"><RefreshCw size={13}/> Refresh</button>
                <button onClick={openCreate} className="btn-primary"><PlusCircle size={13}/> Tambah Surat Masuk</button>
            </div>

            <div className="rounded-2xl overflow-hidden border" style={{ borderColor:'var(--border-card)', background:'var(--bg-card)' }}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-table-head)' }}>
                            <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400">No. Surat / Perihal</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400">Pengirim</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400">Tanggal</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400">Lampiran</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">Belum ada data surat masuk</td></tr>
                        ) : filtered.map((m, i) => (
                            <tr key={m.id} className="border-b transition-colors" style={{ borderColor:'var(--border)', background: i%2===0 ? 'transparent' : 'var(--bg-table-even)' }}>
                                <td className="py-3 px-4">
                                    <p className="text-sm font-semibold text-primary">{m.reference_number}</p>
                                    <p className="text-xs text-muted">{m.subject}</p>
                                </td>
                                <td className="py-3 px-4 text-sm text-primary">{m.entity}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-1 text-xs text-muted">
                                        <Calendar size={12}/> Surat: {m.date}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted mt-1">
                                        <Download size={12}/> Terima: {m.received_date || '-'}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    {m.file_path ? (
                                        <a href={`${baseURL}/storage/${m.file_path}`} target="_blank" rel="noreferrer" 
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20">
                                            <FileText size={12}/> Lihat Scan
                                        </a>
                                    ) : <span className="text-xs text-gray-500">-</span>}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"><Edit size={14}/></button>
                                        <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Edit Surat Masuk' : 'Tambah Surat Masuk'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-400">Nomor Surat *</label>
                            <input type="text" value={formData.reference_number} onChange={e => setFormData({...formData, reference_number: e.target.value})} className="input-dark w-full" required/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-400">Pengirim Instansi/Pribadi *</label>
                            <input type="text" value={formData.entity} onChange={e => setFormData({...formData, entity: e.target.value})} className="input-dark w-full" required/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-400">Perihal *</label>
                        <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="input-dark w-full" required/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-400">Tgl. Surat *</label>
                            <ModernDatepicker  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input-dark w-full" required/>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-gray-400">Tgl. Diterima Sekolah</label>
                            <ModernDatepicker  value={formData.received_date} onChange={e => setFormData({...formData, received_date: e.target.value})} className="input-dark w-full"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-400">Disposisi / Catatan (Opsional)</label>
                        <textarea value={formData.disposition} onChange={e => setFormData({...formData, disposition: e.target.value})} className="input-dark w-full h-20" placeholder="Teruskan kepada..."/>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-400">Upload Scan Fisik (Opsional)</label>
                        <input type="file" onChange={e => setFormData({...formData, file: e.target.files[0]})} className="input-dark w-full text-sm" accept=".pdf,image/*"/>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
                        <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Arsip</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
