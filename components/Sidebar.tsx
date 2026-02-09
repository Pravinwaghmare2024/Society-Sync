
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab, onLogout }) => {
  const isAdmin = role === UserRole.ADMIN;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'maintenance', label: 'Accounting', icon: '💰' },
    { id: 'notices', label: 'Notices', icon: '📢' },
    { id: 'complaints', label: 'Helpdesk', icon: '🛠️' },
    { id: 'staff', label: 'Staff Hub', icon: '👷' },
    ...(isAdmin ? [{ id: 'settings', label: 'Settings', icon: '⚙️' }] : []),
  ];

  return (
    <aside className="w-72 bg-slate-900 text-white min-h-screen flex flex-col p-8 m-4 rounded-[2.5rem] shadow-2xl relative z-50">
      <div className="mb-14 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-900/40">
          S
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter leading-none">SocietySync</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Enterprise ERP</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs tracking-wide uppercase ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-xl opacity-80">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-800">
        <div className="p-5 bg-slate-800/50 rounded-3xl mb-4 border border-slate-800">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated ID</p>
          <p className="text-xs font-bold text-white truncate">
            {isAdmin ? 'System Admin' : 'Resident Portal'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-green-400 font-bold uppercase">Online</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <span>🚪</span> Terminate Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
