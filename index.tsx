import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

// --- 1. TYPES ---
enum UserRole { ADMIN = 'ADMIN', RESIDENT = 'RESIDENT' }
enum StaffRole { CLEANING = 'Cleaning', PLUMBING = 'Plumbing', ELECTRICAL = 'Electrical', SECURITY = 'Security', GARDENING = 'Gardening' }

interface User { id: string; name: string; unit: string; role: UserRole; email: string; }
interface Block { id: string; name: string; floors: number; unitsPerFloor: number; totalUnits: number; }
interface MaintenanceRecord { id: string; unit: string; amount: number; dueDate: string; status: 'PAID' | 'PENDING' | 'OVERDUE'; month: string; paidDate?: string; }
interface Notice { id: string; title: string; content: string; date: string; priority: 'LOW' | 'MEDIUM' | 'HIGH'; author: string; }
interface Complaint { id: string; title: string; description: string; category: string; status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'; residentId: string; residentName: string; unit: string; createdAt: string; aiPriority?: string; aiSummary?: string; }

// --- 2. MOCK DATA ---
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
  { id: 'm4', unit: 'A-302', amount: 2500, dueDate: '2023-11-05', status: 'PAID', month: 'November', paidDate: '2023-11-03' },
];

const INITIAL_COMPLAINTS: Complaint[] = [
  { id: 'c1', title: 'Leaking Tap', description: 'Kitchen tap is leaking.', category: 'Plumbing', status: 'OPEN', residentId: 'u1', residentName: 'John Doe', unit: 'A-101', createdAt: '2023-11-18' },
  { id: 'c2', title: 'Common Light Out', description: 'Corridor light on 4th floor not working.', category: 'Electrical', status: 'IN_PROGRESS', residentId: 'u1', residentName: 'John Doe', unit: 'A-101', createdAt: '2023-11-19' },
];

// --- 3. AI SERVICES ---
const getApiKey = () => {
  if (typeof window !== 'undefined' && (window as any).process && (window as any).process.env) {
    return (window as any).process.env.API_KEY || "";
  }
  return "";
};

const getAIClient = () => new GoogleGenAI({ apiKey: getApiKey() });

// --- 4. COMPONENTS ---

const Dashboard = ({ user, maintenance, notices, blocks, complaints }: any) => {
  const isAdmin = user.role === UserRole.ADMIN;

  // Stats Calculations
  const totalPending = maintenance.filter((m: any) => m.status !== 'PAID').reduce((acc: number, cur: any) => acc + cur.amount, 0);
  const totalCollected = maintenance.filter((m: any) => m.status === 'PAID').reduce((acc: number, cur: any) => acc + cur.amount, 0);
  const totalUnits = blocks.reduce((acc: number, b: any) => acc + b.totalUnits, 0);
  const collectionRate = maintenance.length > 0 ? Math.round((maintenance.filter((m: any) => m.status === 'PAID').length / maintenance.length) * 100) : 0;
  
  // Complaint Categorization
  const complaintStats = useMemo(() => {
    const counts: any = {};
    complaints.forEach((c: any) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [complaints]);

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
          <p className="text-slate-500 font-medium">{isAdmin ? 'Admin Intelligence Hub' : `Dashboard for ${user.unit}`}</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full border border-amber-200 text-xs font-black uppercase tracking-widest flex items-center gap-2">
               🛡️ Admin Control Active
            </div>
          )}
          <div className="bg-white px-5 py-2.5 rounded-full border border-slate-200 text-sm font-bold text-slate-600 shadow-sm flex items-center gap-2">
            📍 Grand View Residency
          </div>
        </div>
      </div>
      
      {/* Admin Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-lg">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Total Collected</p>
          <p className="text-3xl font-black text-green-600">₹{totalCollected}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2">Historical Cumulative</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-lg">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Total Dues</p>
          <p className="text-3xl font-black text-rose-600">₹{totalPending}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2">{maintenance.filter((m:any) => m.status === 'PENDING').length} Units Pending</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-lg">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Collection Rate</p>
          <p className="text-3xl font-black text-indigo-600">{collectionRate}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
             <div className="bg-indigo-600 h-full" style={{ width: `${collectionRate}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-lg">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Open Complaints</p>
          <p className="text-3xl font-black text-slate-900">{complaints.filter((c:any) => c.status !== 'RESOLVED').length}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2">Requiring Attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Notice Card */}
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between overflow-hidden relative min-h-[250px]">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-1">Critical Announcements</h3>
            <p className="opacity-80 text-sm leading-relaxed mt-4">{notices[0]?.content || "No active notices."}</p>
          </div>
          <button className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-white/30 self-start mt-4">View History</button>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Complaints Breakdown Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-2">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Complaints by Category</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Helpdesk Metrics</span>
           </div>
           <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={complaintStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                       {complaintStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#10b981', '#f59e0b'][index % 4]} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
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
        <h3 className="text-xl font-black text-slate-900 mb-6">Society Topology & Master Data</h3>
        <p className="text-slate-500 mb-8 text-sm max-w-2xl">Configure building structures to generate automated maintenance logs and resident directories.</p>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Block / Tower Name</label>
            <input required type="text" placeholder="e.g. Tower C" value={newBlock.name} onChange={e => setNewBlock({...newBlock, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold placeholder:text-slate-300" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Total Floors</label>
            <input required type="number" min="1" value={newBlock.floors} onChange={e => setNewBlock({...newBlock, floors: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Units per Floor</label>
            <input required type="number" min="1" value={newBlock.unitsPerFloor} onChange={e => setNewBlock({...newBlock, unitsPerFloor: parseInt(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 outline-none font-bold" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">Register Tower</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blocks.map((b: Block) => (
          <div key={b.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl">🏢</div>
              <button onClick={() => onDeleteBlock(b.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-600 p-2 font-black text-xs uppercase tracking-widest">Remove</button>
            </div>
            <h4 className="text-2xl font-black text-slate-900 mb-1">{b.name}</h4>
            <div className="flex gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">
              <span>{b.floors} Floors</span>
              <span className="opacity-30">•</span>
              <span>{b.totalUnits} Units Total</span>
            </div>
            <div className="mt-10 grid grid-cols-6 gap-1.5 h-3">
               {Array.from({length: Math.min(b.floors, 18)}).map((_, i) => (
                 <div key={i} className="bg-indigo-100 rounded-sm"></div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Maintenance = ({ records, onPay }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6">Month</th>
              <th className="px-8 py-6">Resident Unit</th>
              <th className="px-8 py-6">Billing Amount</th>
              <th className="px-8 py-6">Payment Status</th>
              <th className="px-8 py-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6 font-bold text-slate-900">{r.month}</td>
                <td className="px-8 py-6 font-bold text-slate-500">{r.unit}</td>
                <td className="px-8 py-6 font-black text-slate-900 tracking-tighter">₹{r.amount.toLocaleString()}</td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${r.status === 'PAID' ? 'bg-green-100 text-green-700' : r.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  {r.status === 'PAID' ? (
                    <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">Download Receipt</button>
                  ) : (
                    <button onClick={() => onPay(r.id)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Make Payment</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [loginEmail, setLoginEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('society_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (found) {
      setUser(found);
      localStorage.setItem('society_user', JSON.stringify(found));
    } else {
      alert("Try: admin@society.com (Admin) or john@example.com (Resident)");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('society_user');
  };

  const handlePay = (id: string) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: 'PAID' as any, paidDate: new Date().toLocaleDateString() } : m));
    alert("Payment verified and recorded.");
  };

  const handleAddBlock = (block: Block) => setBlocks([...blocks, block]);
  const handleDeleteBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center animate-in">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mb-10 mx-auto shadow-xl shadow-indigo-100">S</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">SocietySync</h1>
          <p className="text-slate-400 font-bold mb-10 text-[10px] uppercase tracking-widest">Enterprise ERP Portal</p>
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Corporate Identity Email</label>
              <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email address" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 outline-none font-bold text-slate-900 placeholder:text-slate-300" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all uppercase text-[10px] tracking-widest">Authenticate Session</button>
          </form>
          <p className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Access Protected by SocietySync MDM</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    ...(user.role === UserRole.ADMIN ? [{ id: 'setup', label: 'Setup ERP', icon: '🏗️' }] : []),
    { id: 'maintenance', label: 'Accounting', icon: '💰' },
    { id: 'notices', label: 'Notices', icon: '📢' },
    { id: 'complaints', label: 'Helpdesk', icon: '🛠️' },
    { id: 'staff', label: 'Personnel', icon: '👷' },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col p-8 m-4 rounded-[2.5rem] shadow-2xl">
        <div className="mb-14 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">S</div>
          <h1 className="text-xl font-black tracking-tight uppercase tracking-widest text-[14px]">SocietySync</h1>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black capitalize text-xs tracking-wide ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto">
          <div className="bg-slate-800 p-5 rounded-3xl mb-4">
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated Identity</p>
             <p className="text-xs font-black text-white truncate">{user.name}</p>
             <p className="text-[9px] font-bold text-indigo-400 mt-1 uppercase tracking-widest">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="w-full text-rose-400 font-black text-[10px] uppercase tracking-widest p-4 hover:bg-rose-400/10 rounded-2xl transition-all">🚪 Terminate Session</button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{user.role} ACCESS • UNIT {user.unit}</p>
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab.replace('dashboard', 'Overview').replace('setup', 'ERP Configuration')}</h2>
          </div>
          <div className="flex items-center gap-4">
             {user.role === UserRole.ADMIN && (
               <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500 shadow-lg shadow-indigo-100">
                  Admin Toolset
               </div>
             )}
             <div className="w-14 h-14 bg-indigo-100 rounded-2xl border border-indigo-200 flex items-center justify-center font-black text-indigo-600 text-xl shadow-sm">{user.name[0]}</div>
          </div>
        </header>

        <div className="max-w-6xl">
          {activeTab === 'dashboard' && <Dashboard user={user} maintenance={maintenance} notices={notices} blocks={blocks} complaints={complaints} />}
          {activeTab === 'setup' && <SetupModule blocks={blocks} onAddBlock={handleAddBlock} onDeleteBlock={handleDeleteBlock} />}
          {activeTab === 'maintenance' && <Maintenance records={user.role === UserRole.ADMIN ? maintenance : maintenance.filter(m => m.unit === user.unit)} onPay={handlePay} />}
          
          {['notices', 'complaints', 'staff'].includes(activeTab) && (
            <div className="bg-white p-24 rounded-[3.5rem] border border-slate-100 shadow-sm text-center animate-in">
              <div className="text-7xl mb-8">🛠️</div>
              <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">{activeTab} Interface</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">This data stream is being synchronized with the SocietySync cloud services for enterprise accuracy.</p>
              {user.role === UserRole.ADMIN && <button className="mt-10 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-100">Synchronize Master Data</button>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Application Entry
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
