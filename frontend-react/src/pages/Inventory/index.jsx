import { useState } from 'react';
import { PackageSearch, Archive, ArrowUpFromLine } from 'lucide-react';
import PremiumTabs from '../../components/PremiumTabs';
import TabAssets from './components/TabAssets';
import TabLoans from './components/TabLoans';

export default function Inventory() {
    const [tab, setTab] = useState('assets');
    const [quickLoanItem, setQuickLoanItem] = useState(null);

    const handleQuickLoan = (item) => {
        setQuickLoanItem(item);
        setTab('loans'); // pindah ke tab peminjaman
    };

    const tabs = [
        { id: 'assets', label: 'Daftar Aset', icon: Archive },
        { id: 'loans', label: 'Peminjaman', icon: ArrowUpFromLine },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}>
                    <PackageSearch size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Inventaris Sekolah</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Kelola aset, cetak & scan QR Code, serta riwayat peminjaman</p>
                </div>
            </div>

            <PremiumTabs 
                tabs={tabs} 
                activeTab={tab} 
                setActiveTab={setTab} 
                colorFrom="#3b82f6" 
                colorTo="#0ea5e9" 
                shadowColor="rgba(59,130,246,0.35)" 
            />

            {tab === 'assets' ? (
                <TabAssets onQuickLoan={handleQuickLoan} />
            ) : (
                <TabLoans preselectedItem={quickLoanItem} onClearPreselect={() => setQuickLoanItem(null)} />
            )}
        </div>
    );
}
