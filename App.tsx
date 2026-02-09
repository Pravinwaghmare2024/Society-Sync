
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
  version: '3.0.1-prod'
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [society, setSociety] = useState<SocietySettings>(DEFAULT_SOCIETY);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [loginEmail, setLoginEmail] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('society_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedSociety = localStorage.getItem('society_profile');
    if (savedSociety) setSociety(JSON.parse(savedSociety));

    const savedConfig = localStorage.getItem('society_system_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  const handleUpdateSociety = (newProfile: SocietySettings) => {
    setSociety(newProfile);
    localStorage.setItem('society_profile', JSON.stringify(newProfile));
  };

  const handleUpdateConfig = (newConfig: SystemConfig) => {
    setConfig(newConfig);
    localStorage.setItem('society_system_config', JSON.stringify(newConfig));
  };

  const handleResetDB = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('society_user', JSON.stringify(foundUser));
    } else {
      alert("Invalid credentials. Please use admin@society.com or john@example.com");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('society_user');
  };

  const addNotice = (notice: Partial<Notice>) => {
    const newNotice: Notice = {
      id: Date.now().toString(),
      title: notice.title || 'No Title',
      content: notice.content || '',
      date: notice.date || new Date().toISOString().split('T')[0],
      priority: notice.priority || 'MEDIUM',
      author: notice.author || 'Admin'
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
    alert("Payment Synchronized with Bank Gateway.");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mb-10 mx-auto shadow-xl shadow-indigo-100">S</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">SocietySync</h1>
          <p className="text-slate-400 font-bold mb-10 text-[10px] uppercase tracking-widest tracking-tight">Enterprise ERP Portal</p>
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Authenticate Email</label>
              <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email address" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 outline-none font-bold text-slate-900" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest">Sign In to Workspace</button>
          </form>
          <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Protected by Enterprise MDM</p>
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
        return <Settings settings={society} config={config} onUpdateSettings={handleUpdateSociety} onUpdateConfig={handleUpdateConfig} onResetDatabase={handleResetDB} />;
      default:
        return <Dashboard role={user.role} maintenance={maintenance} complaints={complaints} notices={notices} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar
        role={user.role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto h-screen p-12 relative">
        <header className="mb-12 flex justify-between items-start sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md z-10 py-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{user.role} SESSION • UNIT {user.unit}</p>
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab}</h2>
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

        {/* Footer Production Indicator */}
        <footer className="mt-20 py-8 border-t border-slate-100 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> System Active</span>
              <span>•</span>
              <span>Mode: {config.dbMode}</span>
              <span>•</span>
              <span>Version: {config.version}</span>
           </div>
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              © 2024 SocietySync MDM Systems
           </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
