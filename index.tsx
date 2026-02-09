import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- 1. TYPES ---
enum UserRole { ADMIN = 'ADMIN', RESIDENT = 'RESIDENT' }
enum StaffRole { CLEANING = 'Cleaning', PLUMBING = 'Plumbing', ELECTRICAL = 'Electrical', SECURITY = 'Security', GARDENING = 'Gardening' }

interface User { id: string; name: string; unit: string; role: UserRole; email: string; }
interface StaffMember { id: string; name: string; phone: string; role: StaffRole; allocatedFloors: number[]; availability: string; }
interface MaintenanceRecord { id: string; unit: string; amount: number; dueDate: string; status: 'PAID' | 'PENDING' | 'OVERDUE'; month: string; paidDate?: string; }
interface Notice { id: string; title: string; content: string; date: string; priority: 'LOW' | 'MEDIUM' | 'HIGH'; author: string; }
interface Complaint { id: string; title: string; description: string; category: string; status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'; residentId: string; residentName: string; unit: string; createdAt: string; aiPriority?: string; aiSummary?: string; }

// --- 2. MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Doe', unit: 'A-101', role: UserRole.RESIDENT, email: 'john@example.com' },
  { id: 'u2', name: 'Admin Jane', unit: 'Office', role: UserRole.ADMIN, email: 'admin@society.com' },
];

const INITIAL_NOTICES: Notice[] = [
  { id: 'n1', title: 'Elevator Maintenance', content: 'Block A lift will be off from 10AM-2PM tomorrow.', date: '2023-11-20', priority: 'HIGH', author: 'Admin' }
];

const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm1', unit: 'A-101', amount: 2500, dueDate: '2023-11-05', status: 'PAID', month: 'November', paidDate: '2023-11-02' },
  { id: 'm2', unit: 'A-101', amount: 2500, dueDate: '2023-12-05', status: 'PENDING', month: 'December' },
];

// --- 3. AI SERVICES ---
// Use standard property access to avoid Babel/TypeScript parsing issues in standalone mode
const getApiKey = () => {
  if (typeof window !== 'undefined' && (window as any).process && (window as any).process.env) {
    return (window as any).process.env.API_KEY || "";
  }
  return "";
};

const getAIClient = () => new GoogleGenAI({ apiKey: getApiKey() });

// --- 4. DASHBOARD COMPONENT ---
const Dashboard = ({ user, maintenance, notices }: any) => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Hello, {user.name}</h2>
        <p className="text-slate-500 font-medium">Welcome back to the portal.</p>
      </div>
      <div className="bg-white px-4 py-2 rounded-full border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">
        📍 Grand View Residency
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 col-span-2 flex flex-col justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-2">Latest Notice</h3>
          <p className="opacity-90 leading-relaxed max-w-md">{notices[0]?.content || "No new notices today."}</p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
      </div>
      
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
        <p className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Pending Bills</p>
        <p className="text-4xl font-black text-slate-900 mb-4">
          ₹{maintenance.filter((m: any) => m.status !== 'PAID').reduce((acc: number, cur: any) => acc + cur.amount, 0)}
        </p>
        <button className="w-full bg-slate-100 text-slate-900 py-3 rounded-2xl font-black hover:bg-slate-200 transition-colors">Pay Dues</button>
      </div>
    </div>
  </div>
);

// --- 5. MAINTENANCE COMPONENT ---
const Maintenance = ({ records, onPay }: any) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6">Month</th>
              <th className="px-8 py-6">Amount</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="px-8 py-6 font-bold text-slate-900">{r.month}</td>
                <td className="px-8 py-6 font-black text-slate-900">₹{r.amount}</td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${r.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  {r.status === 'PAID' ? (
                    <button className="text-indigo-600 font-bold text-xs uppercase tracking-wider">Receipt</button>
                  ) : (
                    <button onClick={() => onPay(r.id)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-black text-xs">PAY</button>
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

// --- 6. MAIN APP ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [maintenance, setMaintenance] = useState(INITIAL_MAINTENANCE);
  const [notices, setNotices] = useState(INITIAL_NOTICES);
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
      alert("Try: admin@society.com or john@example.com");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('society_user');
  };

  const handlePay = (id: string) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: 'PAID' as any } : m));
    alert("Payment successful!");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mb-10 mx-auto shadow-xl shadow-indigo-100">S</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">SocietySync</h1>
          <p className="text-slate-400 font-bold mb-10 text-xs uppercase tracking-widest">Desktop Portal</p>
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Work Email</label>
              <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email address" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 outline-none font-medium focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col p-8 m-4 rounded-[2.5rem] shadow-2xl">
        <div className="mb-14 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">S</div>
          <h1 className="text-xl font-black tracking-tight">SocietySync</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {['dashboard', 'maintenance', 'notices', 'complaints', 'staff'].map(id => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black capitalize text-xs tracking-wide ${activeTab === id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <span className="text-lg">{id === 'dashboard' ? '📊' : id === 'maintenance' ? '💰' : id === 'notices' ? '📢' : id === 'complaints' ? '🛠️' : '👷'}</span>
              {id}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto">
          <button onClick={handleLogout} className="w-full text-rose-400 font-black text-[10px] uppercase tracking-widest p-4 hover:bg-rose-400/10 rounded-2xl transition-all">🚪 Logout Session</button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{user.role} • UNIT {user.unit}</p>
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab}</h2>
          </div>
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl border border-indigo-200 flex items-center justify-center font-black text-indigo-600">{user.name[0]}</div>
        </header>

        <div className="max-w-5xl">
          {activeTab === 'dashboard' && <Dashboard user={user} maintenance={maintenance} notices={notices} />}
          {activeTab === 'maintenance' && <Maintenance records={maintenance.filter(m => user.role === UserRole.ADMIN || m.unit === user.unit)} onPay={handlePay} />}
          {['notices', 'complaints', 'staff'].includes(activeTab) && (
            <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm text-center">
              <div className="text-6xl mb-6">🛠️</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{activeTab} Module</h3>
              <p className="text-slate-500 font-medium">Syncing with society cloud...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Render entry point
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
