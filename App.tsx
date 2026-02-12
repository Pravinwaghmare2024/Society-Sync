import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Maintenance from './components/Maintenance';
import Notices from './components/Notices';
import Complaints from './components/Complaints';
import Staff from './components/Staff';
import Settings from './components/Settings';
import { 
  User, UserRole, MaintenanceRecord, Notice, Complaint, StaffMember, SocietySettings, SystemConfig 
} from './types';
import { MOCK_USERS, MOCK_STAFF, MOCK_MAINTENANCE, MOCK_NOTICES, MOCK_COMPLAINTS } from './constants';

const DEFAULT_CONFIG: SystemConfig = {
  dbMode: 'LOCAL_STORAGE',
  apiEndpoint: 'https://api.societysync.com/v1',
  authToken: '',
  dbHost: 'localhost',
  dbPort: 5432,
  dbName: 'societysync_prod',
  dbUser: 'admin',
  dbPassword: '',
  dbSsl: true,
  isMaintenanceMode: false,
  version: '3.0.1',
  webServer: { basePath: '/', staticCacheMaxAge: 7, enableGzip: true, enableCsp: true, hstsMaxAge: 31536000 },
  smtp: { host: 'smtp.office365.com', port: 587, user: 'notifications@society.com', secure: true, senderName: 'SocietySync Alerts' }
};

const DEFAULT_SOCIETY: SocietySettings = {
  id: 'soc_1',
  code: 'GVR001',
  name: "Grand View Residency",
  address: "123 Skyline Ave",
  registrationNo: "REG-8899",
  gstNumber: "", baseMaintenance: 2500, lateFeePercent: 10, billingDay: 5
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [societyCode, setSocietyCode] = useState('GVR001'); // Default to first society
  
  // App Data State (Multi-tenant)
  const [societies, setSocieties] = useState<SocietySettings[]>([DEFAULT_SOCIETY]);
  const [activeSocietyId, setActiveSocietyId] = useState<string>('soc_1');
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);

  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);

  // Derived State for Current View
  const activeSociety = societies.find(s => s.id === activeSocietyId) || societies[0];
  const currentSocietyUsers = allUsers.filter(u => u.societyId === activeSocietyId);
  const currentComplaints = complaints.filter(c => c.societyId === activeSocietyId);
  const currentNotices = notices.filter(n => n.societyId === activeSocietyId);
  const currentMaintenance = maintenance.filter(m => m.societyId === activeSocietyId);
  const currentStaff = staff.filter(s => s.societyId === activeSocietyId);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Find Society
    const society = societies.find(s => s.code === societyCode);
    if (!society) {
      alert("Invalid Society Code");
      return;
    }

    // 2. Find User in that Society
    const found = allUsers.find(u => 
      u.username === username && 
      u.password === password && 
      u.societyId === society.id
    );

    if (found) { 
      setActiveSocietyId(society.id);
      setUser(found); 
      localStorage.setItem('ss_session', JSON.stringify({ user: found, societyId: society.id })); 
    } else {
      alert("Invalid credentials for this society.");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('ss_session');
    if (saved) {
      const { user, societyId } = JSON.parse(saved);
      setUser(user);
      setActiveSocietyId(societyId);
    }
  }, []);

  const handleLogout = () => { setUser(null); localStorage.removeItem('ss_session'); };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-8 mx-auto shadow-lg shadow-indigo-100">S</div>
          <h1 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">SocietySync</h1>
          <form onSubmit={handleLogin} className="space-y-4">
             <div className="text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Society Login Code</label>
              <input required type="text" value={societyCode} onChange={e => setSocietyCode(e.target.value)} placeholder="e.g. GVR001" className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold outline-none text-slate-900" />
            </div>
            <div className="text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input required type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold outline-none text-slate-900" />
            </div>
            <div className="text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold outline-none text-slate-900" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors mt-4">Authorize Session</button>
          </form>
          <p className="mt-8 text-xs text-slate-400 font-medium">Restricted Access • System ID: {config.version}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto h-screen p-10">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{user.role} • Unit {user.unit}</p>
            <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tight">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
               <p className="text-sm font-black text-slate-900 leading-none">{user.name}</p>
               <p className="text-[10px] font-bold text-green-500 uppercase mt-1">{user.residencyType || 'OWNER'} • Active</p>
             </div>
             <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600 text-lg">{user.name[0]}</div>
          </div>
        </header>

        <div className="max-w-5xl pb-10">
          {activeTab === 'dashboard' && <Dashboard role={user.role} societyName={activeSociety.name} maintenance={currentMaintenance} complaints={currentComplaints} notices={currentNotices} />}
          {activeTab === 'maintenance' && <Maintenance role={user.role} records={currentMaintenance} onPay={(id)=>setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: 'PAID', paidDate: new Date().toISOString().split('T')[0] } : m))} />}
          {activeTab === 'notices' && <Notices role={user.role} notices={currentNotices} addNotice={(n)=>setNotices([...notices, { ...n, id: Date.now().toString(), societyId: activeSocietyId } as Notice])} />}
          {activeTab === 'complaints' && <Complaints role={user.role} complaints={currentComplaints} addComplaint={(c)=>setComplaints([...complaints, { ...c, id: Date.now().toString(), societyId: activeSocietyId, status: 'OPEN', residentName: user.name, unit: user.unit, createdAt: new Date().toISOString().split('T')[0] } as Complaint])} updateStatus={(id, s)=>setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: s } : c))} />}
          {activeTab === 'staff' && <Staff role={user.role} staff={currentStaff} addStaff={(s)=>setStaff([...staff, { ...s, societyId: activeSocietyId }])} deleteStaff={(id)=>setStaff(staff.filter(s=>s.id!==id))} />}
          {activeTab === 'settings' && (
            <Settings 
              settings={activeSociety} 
              societies={societies}
              config={config}
              updateSettings={(updatedSociety) => setSocieties(prev => prev.map(s => s.id === updatedSociety.id ? updatedSociety : s))} 
              onUpdateConfig={setConfig}
              users={currentSocietyUsers}
              onAddUser={(u) => setAllUsers([...allUsers, { ...u, societyId: activeSocietyId }])}
              onDeleteUser={(id) => setAllUsers(allUsers.filter(u => u.id !== id))}
              staff={currentStaff}
              onAddStaff={(s) => setStaff([...staff, { ...s, societyId: activeSocietyId }])}
              onDeleteStaff={(id) => setStaff(staff.filter(s => s.id !== id))}
              onAddSociety={(s) => setSocieties([...societies, s])}
              onDeleteSociety={(id) => {
                 if (societies.length <= 1) { alert("Cannot delete the last society."); return; }
                 setSocieties(societies.filter(s => s.id !== id));
              }}
              onResetDatabase={() => {
                setAllUsers(MOCK_USERS);
                setComplaints(MOCK_COMPLAINTS);
                setMaintenance(MOCK_MAINTENANCE);
                setNotices(MOCK_NOTICES);
                setStaff(MOCK_STAFF);
                setSocieties([DEFAULT_SOCIETY]);
                setActiveSocietyId(DEFAULT_SOCIETY.id);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;