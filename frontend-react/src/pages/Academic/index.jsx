import { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
    BookOpen, Calendar, School
} from 'lucide-react';
import PremiumTabs from '../../components/PremiumTabs';
import TabKelas from './components/TabKelas';
import TabMapel from './components/TabMapel';
import TabJadwal from './components/TabJadwal';

export default function Academic() {
    const [tab, setTab]         = useState('kelas');
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        api.get('/teachers').then(r => setTeachers(r.data.data || [])).catch(() => {});
    }, []);

    const tabs = [
        { id: 'kelas',  label: 'Kelas',           icon: School },
        { id: 'mapel',  label: 'Mata Pelajaran',   icon: BookOpen },
        { id: 'jadwal', label: 'Jadwal Pelajaran', icon: Calendar },
    ];

    return (
        <div className="p-6 space-y-5">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background:'linear-gradient(135deg, #10b981, #34d399)', boxShadow:'0 4px 12px rgba(16,185,129,0.35)' }}>
                        <BookOpen size={18} className="text-white"/>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color:'var(--text-primary)' }}>Akademik</h1>
                        <p className="text-xs" style={{ color:'var(--text-muted)' }}>Manajemen Kelas, Mata Pelajaran & Jadwal</p>
                    </div>
                </div>
            </div>

            {/* Tab Switch */}
            <PremiumTabs 
                tabs={tabs} 
                activeTab={tab} 
                setActiveTab={setTab} 
                colorFrom="#10b981" 
                colorTo="#34d399" 
                shadowColor="rgba(16,185,129,0.35)" 
            />

            {/* Tab Content */}
            {tab === 'kelas'  && <TabKelas  teachers={teachers}/>}
            {tab === 'mapel'  && <TabMapel/>}
            {tab === 'jadwal' && <TabJadwal teachers={teachers}/>}
        </div>
    );
}
