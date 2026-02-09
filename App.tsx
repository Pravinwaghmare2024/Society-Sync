import React, { useState, useEffect } from 'react';
import { User, UserRole, MaintenanceRecord, Notice, Complaint, StaffMember, SocietySettings, SystemConfig } from './types.ts';
import { MOCK_USERS, MOCK_MAINTENANCE, MOCK_NOTICES, MOCK_COMPLAINTS, MOCK_STAFF } from './constants.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Maintenance from './components/Maintenance.tsx';
import Notices from './components/Notices.tsx';
import Complaints from './components/Complaints.tsx';
import Staff from './components/Staff.tsx';
import Settings from './components/Settings.tsx';

const DEFAULT_SOCIETY: SocietySettings = {
  name: "Grand View Residency",
  address: "123 Skyview Lane, Sector 45, Metropolis",
  registrationNo: "SOC/2023/8812",
  gstNumber: "27AAACG0001A1Z1",
  baseMaintenance: 2500,
  lateFeePercent: 10,
  billingDay: 5
};

const DEFAULT_CONFIG: SystemConfig = {
  dbMode: 'LOCAL_STORAGE',
  apiEndpoint: 'https://api.societysync.com/v1',
  authToken: '',
  isMaintenanceMode: false,
  version: '3.2.1-IIS-STABLE',
  webServer: {
    basePath: '/',
    staticCacheMaxAge: 7,
    enableGzip: true,
    enableCsp: true,
    hstsMaxAge: 31536000
  },
  smtp: {
    host: 'smtp.office365.com',
    port: 587,
    user: 'notifications@grandview.com',
    secure: false,
    senderName: 'SocietySync Admin'
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [society, setSociety] = useState<SocietySettings>(DEFAULT_SOCIETY);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('society_active_session');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedUsers = localStorage.getItem('society_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    const savedStaff = localStorage.getItem('society_staff');
    if (savedStaff) setStaff(JSON.parse(savedStaff));

    const savedSociety = localStorage.getItem('society_profile');
    if (savedSociety) setSociety(JSON.parse(savedSociety));

    const savedConfig = localStorage.getItem('society_system_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  useEffect(() => { localStorage.setItem('society_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('society_staff', JSON.stringify(staff)); }, [staff]);
  useEffect(() => { localStorage.setItem('society_profile', JSON.stringify(society)); }, [society]);
  useEffect(() => { localStorage.setItem('society_system_config', JSON.stringify(config)); }, [config]);

  const handleUpdateSociety = (newProfile: SocietySettings) => setSociety(newProfile);
  const handleUpdateConfig = (newConfig: SystemConfig) => setConfig(newConfig);

  const handleResetDB = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => 
      u.username.toLowerCase() === loginUsername.toLowerCase() && 
      u.password === loginPassword
    );

    if (foundUser) {
      const { password, ...userToSave } = foundUser;
      setUser(userToSave as User);
      localStorage.setItem('society_active_session', JSON.stringify(userToSave));
    } else {
      alert("Verification failed. Check your enterprise credentials.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('society_active_session');
  };

  const addNotice = (notice: Partial<Notice>) => {
    const newNotice: Notice = {
      id: Date.now().toString(),
      title: notice.title || 'No Title',
      content: notice.content || '',
      date: notice.date || new Date().toISOString().split('T')[0],
      priority: notice.priority || 'MEDIUM',
      author: 'Admin'
    };
    setNotices([newNotice, ...notices]);
  };

  const addComplaint = (complaint: Partial<Complaint>) => {
    if (!user) return;
    const newComplaint: Complaint = {
      id: Date.now().toString(),
      title: complaint.title || '',
      description: complaint.description || '',
      category: complaint.category || 'Other',
      status: 'OPEN',
      residentId: user.id,
      residentName: user.name,
      unit: user.unit,
      createdAt: new Date().toISOString().split('T')[0],
      aiPriority: complaint.aiPriority,
      aiSummary: complaint.aiSummary
    };
    setComplaints([newComplaint, ...complaints]);
  };

  const updateComplaintStatus = (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handlePayMaintenance = (id: string) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: 'PAID', paidDate: new Date().toISOString().split('T')[0] } : m));
    alert("Transaction authenticated via Server-Side Link.");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black mb-10 mx-auto shadow-xl shadow-indigo-100">S</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">SocietySync</h1>
          <p className="text-slate-400 font-bold mb-10 text-[10px] uppercase tracking-widest tracking-tight">Enterprise ERP Terminal</p>
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Username</label>
              <input required type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} placeholder="User ID" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Password</label>
              <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest">Sign In to Domain</button>
          </form>
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="flex items-center gap-1.5 text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> IIS Static Handler Active
            </span>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-loose">Protected by Multi-Device MDM Systems • v{config.version}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard role={user.role} maintenance={maintenance} complaints={complaints} notices={notices} />;
      case 'maintenance':
        return <Maintenance role={user.role} records={maintenance.filter(m => user.role === UserRole.ADMIN || m.unit === user.unit)} onPay={handlePayMaintenance} />;
      case 'notices':
        return <Notices role={user.role} notices={notices} addNotice={addNotice} />;
      case 'complaints':
        return <Complaints role={user.role} complaints={user.role === UserRole.ADMIN ? complaints : complaints.filter(c => c.residentId === user.id)} addComplaint={addComplaint} updateStatus={updateComplaintStatus} />;
      case 'staff':
        return <Staff role={user.role} staff={staff} userUnit={user.unit} addStaff={m => setStaff([m as StaffMember, ...staff])} deleteStaff={id => setStaff(staff.filter(s => s.id !== id))} />;
      case 'settings':
        return <Settings 
          settings={society} config={config} users={users} staff={staff}
          onUpdateSettings={handleUpdateSociety} onUpdateConfig={handleUpdateConfig}
          onAddUser={(u) => setUsers([...users, u])} onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
          onAddStaff={(s) => setStaff([...staff, s])} onDeleteStaff={(id) => setStaff(staff.filter(s => s.id !== id))}
          onResetDatabase={handleResetDB} 
        />;
      default:
        return <Dashboard role={user.role} maintenance={maintenance} complaints={complaints} notices={notices} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto h-screen p-12 relative">
        <header className="mb-12 flex justify-between items-start sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md z-10 py-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{user.role} SESSION • UNIT {user.unit}</p>
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight tracking-widest">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-black text-slate-900">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{society.name}</p>
            </div>
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl border border-indigo-200 flex items-center justify-center font-black text-indigo-600 text-xl shadow-sm">{user.name[0]}</div>
          </div>
        </header>

        <div className="max-w-6xl">
          {renderTabContent()}
        </div>

        <footer className="mt-20 py-8 border-t border-slate-100 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> IIS Stream Active</span>
              <span>•</span>
              <span>Persistence: Local Persistent Storage</span>
              <span>•</span>
              <span>IIS Path: {config.webServer.basePath}</span>
              <span>•</span>
              <span>Revision: {config.version}</span>
           </div>
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2024 SocietySync MDM Framework</div>
        </footer>
      </main>
    </div>
  );
};

export default App;