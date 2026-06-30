import { useState } from 'react';
import { Mail as MailIcon, Inbox, Send, FileText, Download } from 'lucide-react';
import PremiumTabs from '../../components/PremiumTabs';
import TabIncoming from './components/TabIncoming';
import TabOutgoing from './components/TabOutgoing';
import TabGenerator from './components/TabGenerator';

export default function EOffice() {
    const [tab, setTab] = useState('incoming');

    const tabs = [
        { id: 'incoming', label: 'Surat Masuk', icon: Inbox },
        { id: 'outgoing', label: 'Surat Keluar', icon: Send },
        { id: 'generator', label: 'Cetak Otomatis', icon: FileText },
    ];

    return (
        <div className="p-6 space-y-5 animate-fade-in">
            {/* Header section identical to other pages */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:'linear-gradient(135deg, #6366f1, #0ea5e9)', boxShadow:'0 4px 12px rgba(99,102,241,0.35)' }}>
                        <MailIcon size={18} className="text-white"/>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color:'var(--text-primary)' }}>Tata Persuratan & Arsip</h1>
                        <p className="text-xs" style={{ color:'var(--text-muted)' }}>Kelola surat masuk, surat keluar, dan cetak otomatis (E-Office)</p>
                    </div>
                </div>
            </div>

            {/* Pill Container Tabs */}
            <PremiumTabs 
                tabs={tabs} 
                activeTab={tab} 
                setActiveTab={setTab} 
                colorFrom="#6366f1" 
                colorTo="#0ea5e9" 
                shadowColor="rgba(99,102,241,0.35)" 
            />

            {/* Tab Contents */}
            {tab === 'incoming' && <TabIncoming />}
            {tab === 'outgoing' && <TabOutgoing />}
            {tab === 'generator' && <TabGenerator />}
        </div>
    );
}
