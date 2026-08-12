import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Award, BookOpen, TrendingUp } from 'lucide-react';
import PremiumTabs from '../../components/PremiumTabs';
import TabInputNilai from './components/TabInputNilai';
import TabRekap from './components/TabRekap';
import TabRapor from './components/TabRapor';
import { useAuthStore } from '../../store/authStore';
import { isGuru } from '../../utils/roles';

export default function Grades() {
    const [tab, setTab]           = useState('input');
    const [classrooms, setClassrooms] = useState([]);
    const [subjects, setSubjects]     = useState([]);

    const user = useAuthStore(state => state.user);
    const guru = isGuru(user);

    useEffect(() => {
        Promise.all([api.get('/classrooms'), api.get('/subjects')])
            .then(async ([cr, sr]) => {
                const allClassrooms = cr.data.data || [];
                const allSubjects   = sr.data.data || [];

                if (!guru) {
                    setClassrooms(allClassrooms);
                    setSubjects(allSubjects);
                    return;
                }

                // Guru hanya boleh melihat kelas & mapel yang benar-benar dia ampu.
                // Backend juga menolak di luar itu, ini agar pilihannya tidak menyesatkan.
                try {
                    const { data } = await api.get('/teacher/assignments');
                    const assignments = data.data || [];
                    const classroomIds = new Set(assignments.map(a => a.classroom_id));
                    const subjectIds   = new Set(assignments.map(a => a.subject_id));
                    (data.homeroom || []).forEach(c => classroomIds.add(c.id));

                    setClassrooms(allClassrooms.filter(c => classroomIds.has(c.id)));
                    setSubjects(allSubjects.filter(s => subjectIds.has(s.id)));
                } catch {
                    setClassrooms([]);
                    setSubjects([]);
                }
            }).catch(() => {});
    }, [guru]);

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
