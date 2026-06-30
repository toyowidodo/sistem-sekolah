import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import Modal from '../../../components/Modal';
import QRScannerModal from '../../../components/QRScannerModal';
import { QRCodeSVG } from 'qrcode.react';
import {
    PackageSearch, PlusCircle, Edit, Trash2, Search, ArrowDownToLine, ArrowUpFromLine, 
    CheckCircle, Archive, Monitor, Book, Paperclip, Wrench, ShieldAlert, QrCode, ScanLine, Printer, Eye
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { swal, CAT_CFG, COND_CFG, fmtPrice } from './Shared';
import ModernSelect from '../../../components/ModernSelect';
import ModernDatepicker from '../../../components/ModernDatepicker';

export default function TabAssets({ onQuickLoan }) {
    const [assets, setAssets] = useState([]);
    const [summary, setSummary] = useState({});
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    
    // UI states
    const [isOpen, setIsOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [qrModalItem, setQrModalItem] = useState(null);
    const [viewModalItem, setViewModalItem] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const fetchAssets = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (catFilter !== 'all') params.set('category', catFilter);
            const r = await api.get(`/inventories?${params}`);
            setAssets(r.data.data || []);
            setSummary(r.data.summary || {});
        } catch {}
    };

    useEffect(() => { fetchAssets(); }, [search, catFilter]);

    const openCreate = () => { reset({ item_code: '', name: '', category: 'elektronik', quantity: 1, condition: 'baik', location: '', purchase_date: '', price: '' }); setEditId(null); setIsOpen(true); };
    const openEdit = (a) => { reset({ ...a, purchase_date: a.purchase_date?.split('T')[0] || '' }); setEditId(a.id); setIsOpen(true); };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'image' && data.image[0]) {
                    formData.append('image', data.image[0]);
                } else if (key !== 'image' && data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });

            // If updating, Laravel requires _method=PUT when sending FormData
            if (editId) {
                formData.append('_method', 'PUT');
                await api.post(`/inventories/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.post('/inventories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            
            swal({ title: 'Sukses!', text: editId ? 'Aset diperbarui.' : 'Aset ditambahkan.', icon: 'success', timer: 1500, showConfirmButton: false });
            setIsOpen(false); fetchAssets();
        } catch (e) { swal({ title: 'Error', text: e.response?.data?.message || 'Gagal', icon: 'error' }); }
    };

    const handleDelete = (a) => swal({
        title: `Hapus ${a.name}?`, icon: 'warning', showCancelButton: true,
        confirmButtonColor: '#ef4444', confirmButtonText: 'Hapus'
    }).then(async r => { if (r.isConfirmed) { await api.delete(`/inventories/${a.id}`); fetchAssets(); } });

    const handleScanSuccess = (decodedText) => {
        const item = assets.find(a => a.item_code === decodedText);
        if (item) {
            swal({
                title: 'QR Code Ditemukan!',
                html: `Barang: <b>${item.name}</b><br/>Status: <b>${COND_CFG[item.condition].label}</b>`,
                icon: 'success', showCancelButton: true,
                confirmButtonText: 'Pinjamkan', cancelButtonText: 'Tutup'
            }).then(r => {
                if (r.isConfirmed && item.condition === 'baik') {
                    onQuickLoan(item);
                } else if (r.isConfirmed && item.condition !== 'baik') {
                    swal({ title: 'Gagal', text: 'Barang tidak dalam kondisi baik, tidak bisa dipinjam.', icon: 'error' });
                }
            });
        } else {
            swal({ title: 'Tidak Ditemukan', text: `Barang dengan kode ${decodedText} tidak ditemukan.`, icon: 'error' });
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Item', val: summary.total_items || 0, c: '#6366f1' },
                    { label: 'Kondisi Baik', val: summary.good_condition || 0, c: '#10b981' },
                    { label: 'Rusak', val: summary.bad_condition || 0, c: '#ef4444' },
                    { label: 'Total Nilai Aset', val: fmtPrice(summary.total_value), c: '#f59e0b' }
                ].map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                        <p className="text-xs font-semibold text-gray-500 uppercase">{s.label}</p>
                        <p className="text-xl font-black mt-1" style={{ color: s.c }}>{s.val}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative w-64">
                        <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / kode..." className="input-dark w-full pl-9" />
                    </div>
                    <ModernSelect value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-dark">
                        <option value="all">Semua Kategori</option>
                        {Object.entries(CAT_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </ModernSelect>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsScannerOpen(true)} className="btn-ghost flex items-center gap-2 text-sm border border-[var(--border)]">
                        <ScanLine size={15}/> Scan QR
                    </button>
                    <button onClick={openCreate} className="btn-primary text-sm"><PlusCircle size={15}/> Tambah Aset</button>
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <table className="w-full text-left text-sm">
                    <thead style={{ background: 'var(--bg-table-head)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th className="p-3 text-gray-400 font-semibold uppercase text-xs">Kode</th>
                            <th className="p-3 text-gray-400 font-semibold uppercase text-xs">Nama & Kategori</th>
                            <th className="p-3 text-gray-400 font-semibold uppercase text-xs">Lokasi</th>
                            <th className="p-3 text-gray-400 font-semibold uppercase text-xs">Qty & Harga</th>
                            <th className="p-3 text-gray-400 font-semibold uppercase text-xs">Kondisi</th>
                            <th className="p-3 text-gray-400 font-semibold uppercase text-xs text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {assets.map(a => {
                            const cat = CAT_CFG[a.category] || CAT_CFG.lainnya;
                            const cond = COND_CFG[a.condition] || COND_CFG.baik;
                            return (
                                <tr key={a.id} className="hover:bg-[var(--bg-table-hover)] transition-colors">
                                    <td className="p-3 font-mono text-xs text-gray-400">{a.item_code}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            {a.image ? (
                                                <img src={a.image} alt={a.name} className="w-10 h-10 rounded-lg object-cover border border-[var(--border)]" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--bg-input)] border border-[var(--border)] text-gray-500">
                                                    <Monitor size={16} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-[var(--text-primary)]">{a.name}</p>
                                                <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-flex items-center gap-1" style={{ background: cat.bg, color: cat.color }}><cat.icon size={10}/> {cat.label}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-[var(--text-secondary)]">{a.location || '-'}</td>
                                    <td className="p-3">
                                        <p className="font-bold text-[var(--text-primary)]">{a.quantity} unit</p>
                                        {a.price > 0 && <p className="text-xs text-gray-500">{fmtPrice(a.price)}</p>}
                                    </td>
                                    <td className="p-3">
                                        <span className="text-xs px-2 py-1 rounded-md font-semibold" style={{ background: cond.bg, color: cond.color }}>{cond.label}</span>
                                    </td>
                                    <td className="p-3 flex justify-end gap-2">
                                        <button onClick={() => setViewModalItem(a)} className="p-1.5 rounded-md text-blue-400 hover:bg-blue-500/10" title="Lihat Detail"><Eye size={14}/></button>
                                        <button onClick={() => setQrModalItem(a)} className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-500/10" title="Lihat QR Code"><QrCode size={14}/></button>
                                        <button onClick={() => openEdit(a)} className="p-1.5 rounded-md text-indigo-400 hover:bg-indigo-500/10" title="Edit"><Edit size={14}/></button>
                                        <button onClick={() => handleDelete(a)} className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10" title="Hapus"><Trash2 size={14}/></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal Form Aset */}
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Edit Aset' : 'Tambah Aset'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase mb-1 block">Kode Barang</label>
                            <input {...register('item_code', {required:true})} className="input-dark w-full" placeholder="INV-001"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase mb-1 block">Kategori</label>
                            <ModernSelect {...register('category')} className="input-dark w-full">
                                {Object.entries(CAT_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                            </ModernSelect>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase mb-1 block">Nama Barang</label>
                        <input {...register('name', {required:true})} className="input-dark w-full" placeholder="Mis: Proyektor Epson X1"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase mb-1 block">Lokasi</label>
                            <input {...register('location')} className="input-dark w-full" placeholder="Lab Komputer"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase mb-1 block">Kondisi</label>
                            <ModernSelect {...register('condition')} className="input-dark w-full">
                                {Object.entries(COND_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                            </ModernSelect>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase mb-1 block">Foto Barang (Opsional)</label>
                        <input type="file" accept="image/*" {...register('image')} className="input-dark w-full text-sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase mb-1 block">Jumlah</label>
                            <input type="number" {...register('quantity')} className="input-dark w-full" defaultValue={1}/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase mb-1 block">Harga Satuan</label>
                            <input type="number" {...register('price')} className="input-dark w-full" placeholder="0"/>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase mb-1 block">Tgl Beli</label>
                            <ModernDatepicker  {...register('purchase_date')} className="input-dark w-full"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
                        <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>

            {/* Modal QR Code Item */}
            <Modal isOpen={!!qrModalItem} onClose={() => setQrModalItem(null)} title="QR Code Aset">
                {qrModalItem && (
                    <div className="flex flex-col items-center p-4">
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                            <QRCodeSVG 
                                value={qrModalItem.item_code} 
                                size={200} 
                                bgColor={"#ffffff"} 
                                fgColor={"#000000"} 
                                level={"Q"} 
                            />
                        </div>
                        <p className="mt-4 text-xl font-black font-mono tracking-wider" style={{ color: 'var(--text-primary)' }}>
                            {qrModalItem.item_code}
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{qrModalItem.name}</p>
                        
                        <div className="mt-6 flex w-full gap-2">
                            <button onClick={() => setQrModalItem(null)} className="btn-ghost flex-1 justify-center">Tutup</button>
                            <button onClick={() => window.print()} className="btn-primary flex-1 justify-center bg-indigo-600"><Printer size={15}/> Cetak</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Detail Aset */}
            <Modal isOpen={!!viewModalItem} onClose={() => setViewModalItem(null)} title="Detail Aset">
                {viewModalItem && (() => {
                    const cat = CAT_CFG[viewModalItem.category] || CAT_CFG.lainnya;
                    const cond = COND_CFG[viewModalItem.condition] || COND_CFG.baik;
                    return (
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                {viewModalItem.image ? (
                                    <img src={viewModalItem.image} alt={viewModalItem.name} className="w-24 h-24 rounded-xl object-cover border border-[var(--border)]" />
                                ) : (
                                    <div className="w-24 h-24 rounded-xl flex items-center justify-center bg-[var(--bg-input)] border border-[var(--border)] text-gray-500">
                                        <Monitor size={32} />
                                    </div>
                                )}
                                <div>
                                    <p className="font-mono text-sm text-gray-500">{viewModalItem.item_code}</p>
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{viewModalItem.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-semibold" style={{ background: cat.bg, color: cat.color }}><cat.icon size={10}/> {cat.label}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: cond.bg, color: cond.color }}>{cond.label}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4 p-4 rounded-xl" style={{ background: 'var(--bg-input)' }}>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Lokasi</p>
                                    <p className="font-semibold text-[var(--text-primary)]">{viewModalItem.location || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Jumlah Tersedia</p>
                                    <p className="font-semibold text-[var(--text-primary)]">{viewModalItem.quantity} unit</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Harga Satuan</p>
                                    <p className="font-semibold text-[var(--text-primary)]">{viewModalItem.price > 0 ? fmtPrice(viewModalItem.price) : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Total Nilai</p>
                                    <p className="font-semibold text-amber-500">{viewModalItem.price > 0 ? fmtPrice(viewModalItem.price * viewModalItem.quantity) : '-'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500 uppercase">Tanggal Pembelian</p>
                                    <p className="font-semibold text-[var(--text-primary)]">{viewModalItem.purchase_date ? new Date(viewModalItem.purchase_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-'}</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-[var(--border)]">
                                <button onClick={() => setViewModalItem(null)} className="btn-ghost">Tutup</button>
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* Modal Scanner QR Code */}
            <QRScannerModal 
                isOpen={isScannerOpen} 
                onClose={() => setIsScannerOpen(false)} 
                onScanSuccess={handleScanSuccess} 
            />
        </div>
    );
}

