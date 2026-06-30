import { useState } from 'react';
import { Award, AlertOctagon, BookOpen, FileText } from 'lucide-react';
import PremiumTabs from '../../components/PremiumTabs';
import TabCategories from './components/TabCategories';
import TabRecords from './components/TabRecords';
import TabReport from './components/TabReport';

export default function StudentPoints() {
    const [activeTab, setActiveTab] = useState('records');

    const tabs = [
        { id: 'records', label: 'Input Poin', icon: BookOpen },
        { id: 'report', label: 'Laporan Poin', icon: FileText },
        { id: 'categories', label: 'Kategori Poin', icon: AlertOctagon },
    ];

    return (
        <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'linear-gradient(135deg, #6366f1, #0ea5e9)', boxShadow:'0 4px 12px rgba(99,102,241,0.35)' }}>
                    <Award size={18} className="text-white"/>
                </div>
                <div>
                    <h1 className="text-lg font-bold" style={{ color:'var(--text-primary)' }}>Buku Penghubung Digital</h1>
                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>Kelola poin kedisiplinan dan prestasi siswa secara digital</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            {/* Tabs Navigation */}
            <PremiumTabs 
                tabs={tabs} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                colorFrom="#6366f1" 
                colorTo="#0ea5e9" 
                shadowColor="rgba(99,102,241,0.35)" 
            />

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'categories' && <TabCategories />}
                {activeTab === 'records' && <TabRecords />}
                {activeTab === 'report' && <TabReport />}
            </div>
        </div>
    );
}
