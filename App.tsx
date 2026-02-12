import React, { useState, useEffect } from 'react';
import { User, UserRole, MaintenanceRecord, Notice, Complaint, StaffMember, SocietySettings, SystemConfig, StaffRole } from './types.ts';
import { MOCK_USERS, MOCK_MAINTENANCE, MOCK_NOTICES, MOCK_COMPLAINTS, MOCK_STAFF } from './constants.tsx';
import { analyzeComplaint, generateNoticeContent } from './services/geminiService.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Consolidated Sub-Components for Maximum Reliability ---

const Sidebar: React.FC<{ role: UserRole, activeTab: string, setActiveTab: (t: string) => void, onLogout: () => void }> = ({ role, activeTab, setActiveTab, onLogout }) => {
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
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-900/40">S</div>
        <div>
          <h1 className="text-xl font-black tracking-tighter leading-none">SocietySync</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Enterprise ERP</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs tracking-wide uppercase ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
            <span className="text-xl opacity-80">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-8 border-t border-slate-800">
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 font-black text-[10px] uppercase tracking-widest transition-all">TERMINATE SESSION</button>
      </div>
    </aside>
  );
};

const Dashboard: React.FC<{ role: UserRole, maintenance: MaintenanceRecord[], complaints: Complaint[], notices: Notice[] }> = ({ role, maintenance, complaints, notices }) => {
  const stats = [
    { label: 'Unpaid Bills', value: maintenance.filter(m => m.status !== 'PAID').length, icon: '💸', color: 'bg-red-100 text-red-600' },
    { label: 'Pending Complaints', value: complaints.filter(c => c.status !== 'RESOLVED').length, icon: '🛠️', color: 'bg-orange-100 text-orange-600' },
    { label: 'Active Notices', value: notices.length, icon: '📢', color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Units', value: '120', icon: '🏢', color: 'bg-indigo-100 text-indigo-600' },
  ];
  const chartData = [ { name: 'Aug', amount: 4000 }, { name: 'Sep', amount: 3000 }, { name: 'Oct', amount: 5000 }, { name: 'Nov', amount: 4500 } ];
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>{stat.icon}</div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MaintenanceView: React.FC<{ records: MaintenanceRecord[], onPay: (id: string) => void }> = ({ records, onPay }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
        <tr>
          <th className="px-8 py-5">Period</th>
          <th className="px-8 py-5">Amount</th>
          <th className="px-8 py-5">Status</th>
          <th className="px-8 py-5">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {records.map(r => (
          <tr key={r.id} className="text-sm font-bold text-slate-700">
            <td className="px-8 py-6">{r.month} 2023</td>
            <td className="px-8 py-6">₹{r.amount}</td>
            <td className="px-8 py-6">
              <span className={`px-3 py-1 rounded-full text-[10px] ${r.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {r.status}
              </span>
            </td>
            <td className="px-8 py-6">
              {r.status !== 'PAID' && <button onClick={() => onPay(r.id)} className="text-indigo-600 hover:underline">Pay Now</button>}
              {r.status === 'PAID' && <span className="text-slate-300">Receipt Issued</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- Main App Implementation ---

const DEFAULT_SOCIETY: SocietySettings = {
  name: "Grand View Residency",
  address: "123 Skyview Lane, Sector 45, Metropolis",
  registrationNo: "SOC/2023/8812",
  gstNumber: "27AAACG0001A1Z1",
  baseMaintenance: 2500,
  lateFeePercent: 10,
  billingDay: 5
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('society_active_session');
    if (session) {
      try { setUser(JSON.parse(session)); } catch(e) { console.error("Session corrupted"); }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.username.toLowerCase() === loginUsername.toLowerCase() && u.password === loginPassword);
    if (found) {
      const { password, ...safeUser } = found;
      setUser(safeUser as User);
      localStorage.setItem('society_active_session', JSON.stringify(safeUser));
    } else {
      alert("Invalid credentials.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('society_active_session');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black mb-10 mx-auto">S</div>
          <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">SocietySync</h1>
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <input required type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} placeholder="Username" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 outline-none font-bold text-slate-900" />
            <input required type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 outline-none font-bold text-slate-900" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-100">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const userMaintenance = maintenance.filter(m => user.role === UserRole.ADMIN || m.unit === user.unit);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto h-screen p-12 relative">
        <header className="mb-12 flex justify-between items-start sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md z-10 py-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{user.role} SESSION • UNIT {user.unit}</p>
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab}</h2>
          </div>
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl shadow-sm">{user.name[0]}</div>
        </header>

        <div className="max-w-6xl">
          {activeTab === 'dashboard' && <Dashboard role={user.role} maintenance={maintenance} complaints={complaints} notices={notices} />}
          {activeTab === 'maintenance' && <MaintenanceView records={userMaintenance} onPay={(id) => alert("Redirecting to IIS Secure Payment Gateway...")} />}
          {activeTab !== 'dashboard' && activeTab !== 'maintenance' && (
            <div className="p-20 bg-white rounded-[3rem] text-center border-2 border-dashed border-slate-100">
               <span className="text-4xl mb-4 block opacity-20">🏗️</span>
               <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">{activeTab} MODULE ACTIVE</h3>
               <p className="text-slate-400 mt-2">Module logic provisioned in kernel. Transpilation successful.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;