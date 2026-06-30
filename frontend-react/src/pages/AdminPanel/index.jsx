import { useState } from 'react';
import { Shield, Users, Activity, Database, AlertTriangle, Settings as SettingsIcon, Wrench } from 'lucide-react';
import PremiumTabs from '../../components/PremiumTabs';
import TabUsers from './components/TabUsers';
import TabRoles from './components/TabRoles';
import TabActivityLog from './components/TabActivityLog';
import TabBackup from './components/TabBackup';
import TabSettings from './components/TabSettings';
import TabMaintenance from './components/TabMaintenance';

export default function AdminPanel() {
    const [tab, setTab] = useState('settings');

    const tabs = [
        { id:'settings',    label:'Pengaturan Sistem', icon: SettingsIcon },
        { id:'users',       label:'Manajemen User',    icon: Users },
        { id:'roles',       label:'Hak Akses',         icon: Shield },
        { id:'activity',    label:'Activity Log',      icon: Activity },
        { id:'backup',      label:'Backup Data',       icon: Database },
        { id:'maintenance', label:'Perawatan Sistem',  icon: Wrench },
    ];

    return (
        <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'linear-gradient(135deg, #ef4444, #f87171)', boxShadow:'0 4px 12px rgba(239,68,68,0.35)' }}>
                    <Shield size={18} className="text-white"/>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold" style={{ color:'var(--text-primary)' }}>Panel Superadmin</h1>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)' }}>
                            <Shield size={9} className="inline mr-0.5"/> SUPERADMIN ONLY
                        </span>
                    </div>
                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>Kelola user, role, pengaturan dan pantau seluruh aktivitas sistem</p>
                </div>
            </div>

            <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
                <AlertTriangle size={15} style={{ color:'#fbbf24', flexShrink:0 }}/>
                <p className="text-xs" style={{ color:'#fbbf24' }}>
                    Halaman ini hanya dapat diakses oleh <strong>Superadmin</strong>. Setiap perubahan akan tercatat di Activity Log.
                </p>
            </div>

            <PremiumTabs 
                tabs={tabs} 
                activeTab={tab} 
                setActiveTab={setTab} 
                colorFrom="#ef4444" 
                colorTo="#f87171" 
                shadowColor="rgba(239,68,68,0.35)" 
            />

            {tab === 'settings'    && <TabSettings/>}
            {tab === 'users'       && <TabUsers/>}
            {tab === 'roles'       && <TabRoles/>}
            {tab === 'activity'    && <TabActivityLog/>}
            {tab === 'backup'      && <TabBackup/>}
            {tab === 'maintenance' && <TabMaintenance/>}
        </div>
    );
}
