import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- 1. TYPES & INTERFACES ---

enum UserRole { ADMIN = 'ADMIN', RESIDENT = 'RESIDENT' }
enum StaffRole { CLEANING = 'Cleaning', PLUMBING = 'Plumbing', ELECTRICAL = 'Electrical', SECURITY = 'Security' }

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

const MOCK_STAFF: StaffMember[] = [
  { id: 's1', name: 'Ramesh Kumar', role: StaffRole.CLEANING, phone: '+91 98765 00001', allocatedFloors: [1, 2, 3], availability: '08:00 AM - 04:00 PM' },
  { id: 's4', name: 'Arjun Electric', role: StaffRole.ELECTRICAL, phone: '+91 98765 00004', allocatedFloors: [], availability: '24/7 (On Call)' },
  { id: 's5', name: 'Vijay Plumber', role: StaffRole.PLUMBING, phone: '+91 98765 00005', allocatedFloors: [], availability: '10:00 AM - 06:00 PM' },
];

const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm1', unit: 'A-101', amount: 2500, dueDate: '2023-11-05', status: 'PAID', month: 'November', paidDate: '2023-11-02' },
  { id: 'm2', unit: 'A-101', amount: 2500, dueDate: '2023-10-05', status: 'PAID', month: 'October', paidDate: '2023-10-04' },
  { id: 'm3', unit: 'A-102', amount: 2500, dueDate: '2023-11-05', status: 'PENDING', month: 'November' },
];

const MOCK_NOTICES: Notice[] = [
  { id: 'n1', title: 'Elevator Maintenance', content: 'Elevator in Block B will be under maintenance tomorrow from 10 AM to 2 PM.', date: '2023-11-20', priority: 'HIGH', author: 'Management' }
];

const MOCK_COMPLAINTS: Complaint[] = [
  { id: 'c1', title: 'Water Leakage', description: 'Major water leakage in kitchen ceiling.', category: 'Plumbing', status: 'OPEN', residentId: 'u1', residentName: 'John Doe', unit: 'A-101', createdAt: '2023-11-18', aiPriority: 'Urgent', aiSummary: 'Ceiling leakage in kitchen needs immediate attention.' }
];

// --- 3. AI SERVICES ---

async function analyzeComplaint(description: string) {
  const ai = new GoogleGenAI({ apiKey: (window as any).process?.env?.API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following housing society complaint and provide a priority (Urgent, Medium, Low) and a short summary: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ["priority", "summary"],
        },
      },
    });
    return JSON.parse(response.text?.trim() || "{}");
  } catch (error) {
    return { priority: 'Medium', summary: description.substring(0, 50) + '...' };
  }
}

async function generateNoticeContent(topic: string) {
  const ai = new GoogleGenAI({ apiKey: (window as any).process?.env?.API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a professional housing society notice about: "${topic}".`,
    });
    return response.text || "Failed to generate content.";
  } catch (error) {
    return "AI generation unavailable.";
  }
}

// --- 4. SUB-COMPONENTS ---

const Sidebar = ({ role, activeTab, setActiveTab, onLogout }: any) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'maintenance', label: 'Maintenance', icon: '💰' },
    { id: 'notices', label: 'Notices', icon: '📢' },
    { id: 'complaints', label: 'Complaints', icon: '🛠️' },
    { id: 'staff', label: 'Staff', icon: '👷' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col p-6 shadow-2xl">
      <div className="mb-12 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">S</div>
        <h1 className="text-xl font-black tracking-tight">SocietySync</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/10' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <button onClick={onLogout} className="mt-auto flex items-center gap-3 px-4 py-3.5 text-rose-400 font-bold hover:bg-rose-500/10 rounded-2xl transition-all">
        <span>🚪</span> Logout
      </button>
    </div>
  );
};

const Dashboard = ({ maintenance, complaints, notices }: any) => {
  const stats = [
    { label: 'Unpaid Bills', value: maintenance.filter((m: any) => m.status !== 'PAID').length, icon: '💸', color: 'bg-red-50 text-red-600' },
    { label: 'Complaints', value: complaints.filter((c: any) => c.status !== 'RESOLVED').length, icon: '🛠️', color: 'bg-orange-50 text-orange-600' },
    { label: 'Active Notices', value: notices.length, icon: '📢', color: 'bg-indigo-50 text-indigo-600' },
  ];

  const chartData = [{ name: 'Sep', amount: 3000 }, { name: 'Oct', amount: 5000 }, { name: 'Nov', amount: 4500 }];

  return (
    <div className="space-y-8 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-2xl mb-4`}>{stat.icon}</div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-4">Community Update</h3>
          <p className="text-indigo-100 max-w-md mb-8">Annual maintenance survey is now live. Please provide your feedback to help us improve your living experience.</p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-bold shadow-lg">View Details</button>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
      </div>
    </div>
  );
};

// --- 5. MAIN APP ---

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [loginEmail, setLoginEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('society_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (e: any) => {
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
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: 'PAID', paidDate: new Date().toLocaleDateString() } : m));
    alert("Payment successful!");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black mb-10 mx-auto shadow-xl shadow-indigo-100">S</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">SocietySync</h1>
          <p className="text-slate-500 mb-10 font-medium">Smart Community Portal</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              required 
              type="email" 
              value={loginEmail} 
              onChange={e => setLoginEmail(e.target.value)} 
              placeholder="Email address" 
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
            />
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight mb-2">{activeTab}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Logged in as {user.name} ({user.role}) • Unit {user.unit}</p>
          </header>

          {activeTab === 'dashboard' && <Dashboard maintenance={maintenance} complaints={complaints} notices={notices} />}
          
          {activeTab === 'maintenance' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Bill Period</th>
                    <th className="px-8 py-5">Unit</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {maintenance.filter(m => user.role === UserRole.ADMIN || m.unit === user.unit).map((r) => (
                    <tr key={r.id}>
                      <td className="px-8 py-6 font-bold text-slate-900">{r.month} 2023</td>
                      <td className="px-8 py-6">{r.unit}</td>
                      <td className="px-8 py-6">₹{r.amount}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          r.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{r.status}</span>
                      </td>
                      <td className="px-8 py-6">
                        {r.status === 'PENDING' && user.role === UserRole.RESIDENT && (
                          <button onClick={() => handlePay(r.id)} className="text-indigo-600 font-black hover:underline">Pay Now</button>
                        )}
                        {r.status === 'PAID' && <span className="text-slate-300">Receipt Issued</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {['notices', 'complaints', 'staff'].includes(activeTab) && (
            <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm text-center">
              <div className="text-6xl mb-6">🏗️</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Module Enhancement</h3>
              <p className="text-slate-500 font-medium">We are currently optimizing the {activeTab} engine for your community.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- 6. RENDER ---

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}