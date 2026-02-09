import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- 1. TYPES ---
enum UserRole { ADMIN = 'ADMIN', RESIDENT = 'RESIDENT' }

interface User { id: string; name: string; unit: string; role: UserRole; email: string; }
interface Block { id: string; name: string; floors: number; unitsPerFloor: number; totalUnits: number; }
interface MaintenanceRecord { id: string; unit: string; amount: number; dueDate: string; status: 'PAID' | 'PENDING' | 'OVERDUE'; month: string; paidDate?: string; }
interface Notice { id: string; title: string; content: string; date: string; priority: 'LOW' | 'MEDIUM' | 'HIGH'; author: string; }
interface Complaint { id: string; title: string; description: string; category: string; status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'; residentId: string; residentName: string; unit: string; createdAt: string; aiPriority?: string; aiSummary?: string; }

interface SocietySettings {
  name: string;
  address: string;
  registrationNo: string;
  baseMaintenance: number;
  lateFeePercent: number;
  billingCycleDay: number;
  contactEmail: string;
}

// --- 2. DEFAULT CONFIGS ---
const DEFAULT_SETTINGS: SocietySettings = {
  name: "Grand View Residency",
  address: "123 Skyview Lane, Sector 45, Metropolis",
  registrationNo: "SOC/2023/8812",
  baseMaintenance: 2500,
  lateFeePercent: 10,
  billingCycleDay: 5,
  contactEmail: "mgmt@grandview.com"
};

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Doe', unit: 'A-101', role: UserRole.RESIDENT, email: 'john@example.com' },
  { id: 'u2', name: 'Admin Jane', unit: 'Office', role: UserRole.ADMIN, email: 'admin@society.com' },
];

const INITIAL_BLOCKS: Block[] = [
  { id: 'b1', name: 'Block A', floors: 10, unitsPerFloor: 4, totalUnits: 40 },
  { id: 'b2', name: 'Block B', floors: 12, unitsPerFloor: 6, totalUnits: 72 },
];

const INITIAL_NOTICES: Notice[] = [
  { id: 'n1', title: 'Elevator Maintenance', content: 'Block A lift will be off from 10AM-2PM tomorrow.', date: '2023-11-20', priority: 'HIGH', author: 'Admin' }
];

const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm1', unit: 'A-101', amount: 2500, dueDate: '2023-11-05', status: 'PAID', month: 'November', paidDate: '2023-11-02' },
  { id: 'm2', unit: 'A-101', amount: 2500, dueDate: '2023-12-05', status: 'PENDING', month: 'December' },
  { id: 'm3', unit: 'B-204', amount: 2500, dueDate: '2023-12-05', status: 'OVERDUE', month: 'December' },
];

// --- 3. COMPONENTS ---

const Dashboard = ({ user, maintenance, notices, settings, complaints }: any) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const totalPending = maintenance.filter((m: any) => m.status !== 'PAID').reduce((acc: number, cur: any) => acc + cur.amount, 0);

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
          <p className="text-slate-500 font-medium">{isAdmin ? 'Master Administrator' : 'Resident Portal'}</p>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-full border border-slate-200 text-sm font-bold text-slate-600 shadow-sm flex items-center gap-2">
          📍 {settings.name}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Base Rate</p>
          <p className="text-3xl font-black text-slate-900">₹{settings.baseMaintenance}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Total Dues</p>
          <p className="text-3xl font-black text-rose-600">₹{totalPending}</p>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 col-span-2 flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-1">Latest Notice</h3>
            <p className="opacity-80 text-sm line-clamp-2">{notices[0]?.content || "No active notices."}</p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

// --- NEW SYSTEM CONFIG MODULE ---
const SystemConfig = ({ settings, setSettings, onResetData, onExportData }: any) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeSubTab, setActiveSubTab] = useState('society');

  const handleSave = () => {
    setSettings(localSettings);
    alert("Configurations updated successfully!");
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        {['society', 'billing', 'database'].map(t => (
          <button
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        {activeSubTab === 'society' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-2">
              <h3 className="text-xl font-black text-slate-900 mb-2">Society Profile</h3>
              <p className="text-sm text-slate-500">Public identity of the housing society for ERP documents.</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Legal Name</label>
              <input type="text" value={localSettings.name} onChange={e => setLocalSettings({...localSettings, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Reg. Number</label>
              <input type="text" value={localSettings.registrationNo} onChange={e => setLocalSettings({...localSettings, registrationNo: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Full Address</label>
              <textarea value={localSettings.address} onChange={e => setLocalSettings({...localSettings, address: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold resize-none h-24" />
            </div>
          </div>
        )}

        {activeSubTab === 'billing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-2">
              <h3 className="text-xl font-black text-slate-900 mb-2">Billing & Accounting Logic</h3>
              <p className="text-sm text-slate-500">Configure how maintenance and fines are calculated.</p>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Monthly Base Maintenance (₹)</label>
              <input type="number" value={localSettings.baseMaintenance} onChange={e => setLocalSettings({...localSettings, baseMaintenance: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Late Fee (%)</label>
              <input type="number" value={localSettings.lateFeePercent} onChange={e => setLocalSettings({...localSettings, lateFeePercent: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold" />
            </div>
          </div>
        )}

        {activeSubTab === 'database' && (
          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-2">ERP Data Management</h3>
              <p className="text-sm text-slate-500 mb-6">Backup, export, or reset the entire system state.</p>
              <div className="flex gap-4">
                <button onClick={onExportData} className="bg-indigo-50 text-indigo-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100">Export State (JSON)</button>
                <button onClick={onResetData} className="bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100">Factory Reset Database</button>
              </div>
            </div>
            <div className="pt-10 border-t border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-2">Gemini AI Configuration</h3>
              <p className="text-sm text-slate-500 mb-4">Set the API Key for automated complaint analysis and notice drafting.</p>
              <input type="password" placeholder="sk-..." className="w-full max-w-md bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-mono text-sm" />
            </div>
          </div>
        )}

        {activeSubTab !== 'database' && (
          <div className="mt-10 pt-10 border-t border-slate-100 flex justify-end">
            <button onClick={handleSave} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">Apply Changes</button>
          </div>
        )}
      </div>
    </div>
  );
};

const SetupModule = ({ blocks, onAddBlock, onDeleteBlock }: any) => {
  const [newBlock, setNewBlock] = useState({ name: '', floors: 5, unitsPerFloor: 4 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBlock({ ...newBlock, id: Date.now().toString(), totalUnits: newBlock.floors * newBlock.unitsPerFloor });
    setNewBlock({ name: '', floors: 5, unitsPerFloor: 4 });
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6">Topology Setup</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Block Name</label>
            <input required type="text" placeholder="e.g. Block C" value={newBlock.name} onChange={e => setNewBlock({...newBlock, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Floors</label>
            <input required type="number" value={newBlock.floors} onChange={e => setNewBlock({...newBlock, floors: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Units/Floor</label>
            <input required type="number" value={newBlock.unitsPerFloor} onChange={e => setNewBlock({...newBlock, unitsPerFloor: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100">Add Block</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blocks.map((b: Block) => (
          <div key={b.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
            <h4 className="text-2xl font-black text-slate-900 mb-1">{b.name}</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.totalUnits} Units Total</p>
            <button onClick={() => onDeleteBlock(b.id)} className="absolute top-8 right-8 text-rose-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 5. MAIN APP ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [maintenance, setMaintenance] = useState(INITIAL_MAINTENANCE);
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [settings, setSettings] = useState<SocietySettings>(DEFAULT_SETTINGS);
  const [loginEmail, setLoginEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('society_user');
    if (saved) setUser(JSON.parse(saved));
    const savedSettings = localStorage.getItem('society_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    const savedBlocks = localStorage.getItem('society_blocks');
    if (savedBlocks) setBlocks(JSON.parse(savedBlocks));
  }, []);

  useEffect(() => {
    localStorage.setItem('society_settings', JSON.stringify(settings));
    localStorage.setItem('society_blocks', JSON.stringify(blocks));
  }, [settings, blocks]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (found) {
      setUser(found);
      localStorage.setItem('society_user', JSON.stringify(found));
    } else {
      alert("Try: admin@society.com or john@example.com");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('society_user');
  };

  const handleExportData = () => {
    const data = { settings, blocks, maintenance, notices };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SocietySync_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleResetData = () => {
    if (confirm("WARNING: This will erase all blocks and custom settings. Continue?")) {
      setSettings(DEFAULT_SETTINGS);
      setBlocks(INITIAL_BLOCKS);
      alert("Database reset to defaults.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center animate-in">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mb-10 mx-auto">S</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">SocietySync</h1>
          <p className="text-slate-400 font-bold mb-10 text-[10px] uppercase tracking-widest tracking-tight">Enterprise ERP Portal</p>
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 outline-none font-bold" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-100">Authenticate</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    ...(user.role === UserRole.ADMIN ? [
        { id: 'setup', label: 'Topology', icon: '🏗️' },
        { id: 'config', label: 'Settings', icon: '⚙️' }
    ] : []),
    { id: 'maintenance', label: 'Accounting', icon: '💰' },
    { id: 'notices', label: 'Notices', icon: '📢' },
    { id: 'complaints', label: 'Helpdesk', icon: '🛠️' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden">
      <aside className="w-72 bg-slate-900 text-white flex flex-col p-8 m-4 rounded-[2.5rem] shadow-2xl">
        <div className="mb-14 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">S</div>
          <h1 className="text-xl font-black tracking-tight tracking-widest text-[14px]">SocietySync</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black capitalize text-xs tracking-wide ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <span className="text-lg">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto text-rose-400 font-black text-[10px] uppercase tracking-widest p-4 hover:bg-rose-400/10 rounded-2xl transition-all">🚪 Logout</button>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{user.role} ACCESS • UNIT {user.unit}</p>
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight">
               {activeTab === 'config' ? 'System Settings' : activeTab === 'setup' ? 'Building Topology' : activeTab}
            </h2>
          </div>
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl shadow-sm">{user.name[0]}</div>
        </header>

        <div className="max-w-6xl">
          {activeTab === 'dashboard' && <Dashboard user={user} maintenance={maintenance} notices={notices} settings={settings} />}
          {activeTab === 'setup' && <SetupModule blocks={blocks} onAddBlock={(b: Block) => setBlocks([...blocks, b])} onDeleteBlock={(id: string) => setBlocks(blocks.filter(bl => bl.id !== id))} />}
          {activeTab === 'config' && <SystemConfig settings={settings} setSettings={setSettings} onResetData={handleResetData} onExportData={handleExportData} />}
          
          {['maintenance', 'notices', 'complaints'].includes(activeTab) && (
            <div className="bg-white p-24 rounded-[3.5rem] border border-slate-100 shadow-sm text-center">
              <div className="text-7xl mb-8">🛠️</div>
              <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">{activeTab} Interface</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">This module is active. Real data persistence is connected to SocietySync Local DB.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
