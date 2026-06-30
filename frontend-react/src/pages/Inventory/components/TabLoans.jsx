import { useEffect, useState } from 'react';
import api from '../../../api/axios';
import Modal from '../../../components/Modal';
import QRScannerModal from '../../../components/QRScannerModal';
import { QRCodeSVG } from 'qrcode.react';
import {
    PackageSearch, PlusCircle, Edit, Trash2, Search, ArrowDownToLine, ArrowUpFromLine, 
    CheckCircle, Archive, Monitor, Book, Paperclip, Wrench, ShieldAlert, QrCode, ScanLine, Printer
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { swal, CAT_CFG, COND_CFG, fmtPrice } from './Shared';
import ModernSelect from '../../../components/ModernSelect';
import ModernDatepicker from '../../../components/ModernDatepicker';

export default function TabLoans({ preselectedItem, onClearPreselect }) {
    const [loans, setLoans] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [statusFilter, setStatusFilter] = useState('dipinjam');
    const [isOpen, setIsOpen] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    const fetchLoans = async () => {
        try {
            const r = await api.get(`/inventory-loans?status=${statusFilter}`);
            setLoans(r.data.data || []);
        } catch {}
    };

    const fetchInventories = async () => {
        try {
            const r = await api.get(`/inventories`);
            setInventories(r.data.data || []);
        } catch {}
    };

    useEffect(() => { fetchLoans(); }, [statusFilter]);
    useEffect(() => { fetchInventories(); }, []);

    // Effect untuk menangani preselected item dari Quick Scan
    useEffect(() => {
        if (preselectedItem) {
            reset({ inventory_id: preselectedItem.id, borrower_name: '', loan_date: new Date().toISOString().split('T')[0] });
            setIsOpen(true);
            onClearPreselect();
        }
    }, [preselectedItem, reset, onClearPreselect]);

    const openLoan = () => { reset({ inventory_id: '', borrower_name: '', loan_date: new Date().toISOString().split('T')[0] }); setIsOpen(true); };

    const onSubmit = async (data) => {
        try {
            await api.post('/inventory-loans', data);
            swal({ title: 'Sukses!', text: 'Peminjaman dicatat.', icon: 'success', timer:1500, showConfirmButton:false});
            setIsOpen(false); fetchLoans();
        } catch (e) { swal({ title: 'Error', text: e.response?.data?.message || 'Gagal', icon: 'error' }); }
    };

    const handleReturn = (l) => {
        swal({
            title: `Pengembalian: ${l.inventory.name}`,
            input: 'select', inputOptions: { baik: 'Kondisi Baik', rusak_ringan: 'Rusak Ringan', rusak_berat: 'Rusak Berat' },
            inputValue: l.inventory.condition,
            showCancelButton: true, confirmButtonText: 'Kembalikan'
        }).then(async r => {
            if (r.isConfirmed) {
                await api.post(`/inventory-loans/${l.id}/return`, { return_date: new Date().toISOString().split('T')[0], condition: r.value });
                fetchLoans();
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 justify-between items-center">
                <div className="flex gap-2 bg-[var(--bg-input)] p-1 rounded-lg border border-[var(--border-input)]">
                    <button onClick={() => setStatusFilter('dipinjam')} className={`px-4 py-1.5 text-sm rounded-md font-semibold ${statusFilter==='dipinjam'?'bg-indigo-500/20 text-indigo-400':'text-gray-500'}`}>Dipinjam</button>
                    <button onClick={() => setStatusFilter('dikembalikan')} className={`px-4 py-1.5 text-sm rounded-md font-semibold ${statusFilter==='dikembalikan'?'bg-emerald-500/20 text-emerald-400':'text-gray-500'}`}>Dikembalikan</button>
                </div>
                <button onClick={openLoan} className="btn-primary text-sm"><ArrowUpFromLine size={15}/> Pinjamkan Barang</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loans.map(l => (
                    <div key={l.id} className="p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-[var(--text-primary)]">{l.inventory?.name}</p>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{l.inventory?.item_code}</p>
                            </div>
                            {l.status === 'dipinjam' 
                                ? <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20">Dipinjam</span>
                                : <span className="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded text-xs font-bold border border-emerald-500/20">Dikembalikan</span>
                            }
                        </div>
                        <div className="bg-[var(--bg-input)] p-3 rounded-lg border border-[var(--border-input)]">
                            <p className="text-xs text-gray-400 uppercase mb-1">Peminjam</p>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{l.borrower_name}</p>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Tgl Pinjam: <strong className="text-gray-300">{new Date(l.loan_date).toLocaleDateString('id-ID')}</strong></span>
                            {l.return_date && <span>Tgl Kembali: <strong className="text-gray-300">{new Date(l.return_date).toLocaleDateString('id-ID')}</strong></span>}
                        </div>
                        {l.status === 'dipinjam' && (
                            <button onClick={() => handleReturn(l)} className="w-full btn-ghost border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-sm py-2">
                                <ArrowDownToLine size={14}/> Tandai Dikembalikan
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Peminjaman Baru">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase mb-1 block">Pilih Barang (Hanya Kondisi Baik)</label>
                        <ModernSelect {...register('inventory_id', {required:true})} className="input-dark w-full">
                            <option value="">-- Pilih Barang --</option>
                            {inventories.filter(i => i.condition === 'baik').map(i => (
                                <option key={i.id} value={i.id}>{i.item_code} - {i.name}</option>
                            ))}
                        </ModernSelect>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase mb-1 block">Nama Peminjam</label>
                        <input {...register('borrower_name', {required:true})} className="input-dark w-full" placeholder="Nama Guru / Siswa"/>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase mb-1 block">Tanggal Pinjam</label>
                        <ModernDatepicker  {...register('loan_date', {required:true})} className="input-dark w-full"/>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
                        <button type="button" onClick={() => setIsOpen(false)} className="btn-ghost">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Pinjaman</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

