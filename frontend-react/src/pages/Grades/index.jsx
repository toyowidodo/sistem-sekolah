import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Award, BookOpen, TrendingUp } from 'lucide-react';
import PremiumTabs from '../../components/PremiumTabs';
import TabInputNilai from './components/TabInputNilai';
import TabRekap from './components/TabRekap';
import TabRapor from './components/TabRapor';

export default function Grades() {
    const [tab, setTab]           = useState('input');
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects]     = useState([]);

    useEffect(() => {
        Promise.all([api.get('/classrooms'), api.get('/subjects')])
            .then(([cr, sr]) => {
                setClassrooms(cr.data.data || []);
                setSubjects(sr.data.data || []);
            }).catch(() => {});
    }, []);

    const tabs = [
        { id: 'input', label: 'Input Nilai',    icon: BookOpen },
        { id: 'rekap', label: 'Rekap Kelas',    icon: TrendingUp },
        { id: 'rapor', label: 'Rapor Siswa',    icon: Award },
    ];

    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow:'0 4px 12px rgba(99,102,241,0.35)' }}>
                    <Award size={18} className="text-white"/>
                </div>
                <div>
                    <h1 className="text-lg font-bold" style={{ color:'var(--text-primary)' }}>Nilai & Rapor</h1>
                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>Input nilai, rekap kelas, dan cetak rapor siswa</p>
                </div>
            </div>

            {/* Tabs */}
            {/* Tabs */}
            <PremiumTabs 
                tabs={tabs} 
                activeTab={tab} 
                setActiveTab={setTab} 
                colorFrom="#6366f1" 
                colorTo="#8b5cf6" 
                shadowColor="rgba(99,102,241,0.35)" 
            />

            {/* Content */}
            {tab === 'input' && <TabInputNilai classrooms={classrooms} subjects={subjects}/>}
            {tab === 'rekap' && <TabRekap classrooms={classrooms}/>}
            {tab === 'rapor' && <TabRapor/>}
        </div>
    );
}
