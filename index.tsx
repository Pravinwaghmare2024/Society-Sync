import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- TYPES & ENUMS ---
enum UserRole {
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT'
}

enum StaffRole {
  CLEANING = 'Cleaning',
  PLUMBING = 'Plumbing',
  ELECTRICAL = 'Electrical',
  SECURITY = 'Security',
  GARDENING = 'Gardening'
}

interface User {
  id: string;
  name: string;
  unit: string;
  role: UserRole;
  email: string;
}

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  allocatedFloors: number[];
  availability: string;
}

interface MaintenanceRecord {
  id: string;
  unit: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  month: string;
  paidDate?: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  author: string;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  residentId: string;
  residentName: string;
  unit: string;
  createdAt: string;
  aiPriority?: string;
  aiSummary?: string;
}

// --- MOCK DATA ---
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Doe', unit: 'A-101', role: UserRole.RESIDENT, email: 'john@example.com' },
  { id: 'u2', name: 'Admin Jane', unit: 'Office', role: UserRole.ADMIN, email: 'admin@society.com' },
];

const MOCK_STAFF: StaffMember[] = [
  { id: 's1', name: 'Ramesh Kumar', role: StaffRole.CLEANING, phone: '+91 98765 00001', allocatedFloors: [1, 2, 3], availability: '08:00 AM - 04:00 PM' },
  { id: 's4', name: 'Arjun Electric', role: StaffRole.ELECTRICAL, phone: '+91 98765 00004', allocatedFloors: [], availability: '24/7 (On Call)' },
  { id: 's5', name: 'Vijay Plumber', role: StaffRole.PLUMBING, phone: '+91 98765 00005', allocatedFloors: [], availability: '10:00 AM - 06:00 PM' },
];

const MOCK_NOTICES: Notice[] = [
  { id: 'n1', title: 'Elevator Maintenance', content: 'Elevator in Block B will be under maintenance tomorrow.', date: '2023-11-20', priority: 'HIGH', author: 'Management' },
];

const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm1', unit: 'A-101', amount: 2500, dueDate: '2023-11-05', status: 'PAID', month: 'November', paidDate: '2023-11-02' },
  { id: 'm3', unit: 'A-102', amount: 2500, dueDate: '2023-11-05', status: 'PENDING', month: 'November' },
];

const MOCK_COMPLAINTS: Complaint[] = [
  { id: 'c1', title: 'Water Leakage', description: 'Major water leakage in kitchen ceiling.', category: 'Plumbing', status: 'OPEN', residentId: 'u1', residentName: 'John Doe', unit: 'A-101', createdAt: '2023-11-18', aiPriority: 'Urgent', aiSummary: 'Ceiling leakage in kitchen needs immediate attention.' }
];

// --- AI SERVICES ---
async function analyzeComplaint(description: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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

// --- COMPONENTS ---

const Sidebar = ({ role, activeTab, setActiveTab, onLogout }: any) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'maintenance', label: 'Maintenance', icon: '💰' },
    { id: 'notices', label: 'Notices', icon: '📢' },
    { id: 'complaints', label: 'Complaints', icon: '🛠️' },
    { id: 'staff', label: 'Staff Directory', icon: '👷' },
  ];
  return (
    <div className="w-64 bg-indigo-900 text-white min-h-screen flex flex-col p-4 shadow-xl">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">S</div>
        <h1 className="text-xl font-bold tracking-tight">SocietySync</h1>
      </div>
      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-700 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-800'}`}>
            <span className="text-xl">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-indigo-800">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-200 hover:bg-red-500/20 hover:text-red-400 transition-all">
          <span>🚪</span><span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ maintenance, complaints, notices }: any) => {
  const stats = [
    { label: 'Unpaid Bills', value: maintenance.filter(m => m.status !== 'PAID').length, icon: '💸', color: 'bg-red-100 text-red-600' },
    { label: 'Complaints', value: complaints.filter(c => c.status !== 'RESOLVED').length, icon: '🛠️', color: 'bg-orange-100 text-orange-600' },
    { label: 'Notices', value: notices.length, icon: '📢', color: 'bg-blue-100 text-blue-600' },
    { label: 'Units', value: '120', icon: '🏢', color: 'bg-indigo-100 text-indigo-600' },
  ];
  const chartData = [{ name: 'Sep', amount: 3000 }, { name: 'Oct', amount: 5000 }, { name: 'Nov', amount: 4500 }];
  return (
    <div className="space-y-8 animate-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>{stat.icon}</div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Maintenance = ({ role, records, onPay }: any) => {
  const isAdmin = role === UserRole.ADMIN;
  return (
    <div className="space-y-6 animate-in">
      <h2 className="text-2xl font-bold text-slate-900">Maintenance Records</h2>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4">Bill Period</th>
              <th className="px-6 py-4">Unit</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.map((record: any) => (
              <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold">{record.month}</td>
                <td className="px-6 py-4">{record.unit}</td>
                <td className="px-6 py-4">₹{record.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {record.status !== 'PAID' && !isAdmin && (
                    <button onClick={() => onPay(record.id)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Pay Now</button>
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

const Complaints = ({ role, complaints, addComplaint, updateStatus }: any) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isAdmin = role === UserRole.ADMIN;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsAnalyzing(true);
    const analysis = await analyzeComplaint(desc);
    addComplaint({ title: desc.substring(0, 25) + '...', description: desc, aiPriority: analysis.priority, aiSummary: analysis.summary });
    setDesc('');
    setIsFormOpen(false);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Complaints</h2>
        {!isAdmin && <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold">{isFormOpen ? 'Cancel' : 'New Complaint'}</button>}
      </div>
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4 border border-indigo-50">
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the issue..." className="w-full p-4 bg-slate-50 rounded-xl outline-none" rows={3} required />
          <button type="submit" disabled={isAnalyzing} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 transition-all">{isAnalyzing ? 'Analyzing with AI...' : 'Submit Complaint'}</button>
        </form>
      )}
      <div className="space-y-4">
        {complaints.map((c: any) => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${c.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-bold">Priority: {c.aiPriority || 'Normal'}</span>
            </div>
            <p className="text-slate-900 font-bold mb-1">{c.title}</p>
            <p className="text-slate-600 text-sm italic">"{c.aiSummary || c.description}"</p>
            {isAdmin && c.status !== 'RESOLVED' && (
              <button onClick={() => updateStatus(c.id, 'RESOLVED')} className="mt-4 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Mark Resolved</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Staff = ({ staff, role, deleteStaff }: any) => {
  const isAdmin = role === UserRole.ADMIN;
  return (
    <div className="space-y-6 animate-in">
      <h2 className="text-2xl font-bold text-slate-900">Staff Directory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((s: any) => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl">👤</div>
              <div>
                <h3 className="font-bold text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase">{s.role}</p>
              </div>
            </div>
            <div className="text-sm space-y-1 mb-4 text-slate-600">
              <p>📞 {s.phone}</p>
              <p>🕒 {s.availability}</p>
            </div>
            {isAdmin && <button onClick={() => deleteStaff(s.id)} className="text-red-500 text-sm font-bold hover:underline">Remove Staff</button>}
          </div>
        ))}
      </div>
    </div>
  );
};

const Notices = ({ notices, role, addNotice }: any) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const isAdmin = role === UserRole.ADMIN;

  const handleCreate = async () => {
    setIsGenerating(true);
    const content = await generateNoticeContent(topic);
    addNotice({ title: topic, content });
    setTopic('');
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <h2 className="text-2xl font-bold text-slate-900">Notice Board</h2>
      {isAdmin && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm flex gap-4">
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Notice topic (e.g. Lift maintenance)..." className="flex-1 bg-slate-50 px-4 py-2 rounded-xl outline-none" />
          <button onClick={handleCreate} disabled={isGenerating || !topic} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50">{isGenerating ? 'AI Writing...' : 'Generate Notice'}</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.map((n: any) => (
          <div key={n.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-900 mb-2">{n.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{n.content}</p>
            <div className="mt-4 text-[10px] text-slate-400 font-bold uppercase">{n.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP ---

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
    if (found) { setUser(found); localStorage.setItem('society_user', JSON.stringify(found)); }
    else { alert("Login failed. Use admin@society.com or john@example.com"); }
  };

  const handleLogout = () => { setUser(null); localStorage.removeItem('society_user'); };

  const addComplaint = (c: Partial<Complaint>) => {
    const newC: Complaint = { id: Date.now().toString(), title: c.title || '', description: c.description || '', category: 'General', status: 'OPEN', residentId: user!.id, residentName: user!.name, unit: user!.unit, createdAt: new Date().toLocaleDateString(), ...c };
    setComplaints([newC, ...complaints]);
  };

  const addNotice = (n: Partial<Notice>) => {
    const newN: Notice = { id: Date.now().toString(), title: n.title || 'Notice', content: n.content || '', date: new Date().toLocaleDateString(), priority: 'MEDIUM', author: 'Admin' };
    setNotices([newN, ...notices]);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard maintenance={maintenance} complaints={complaints} notices={notices} />;
      case 'maintenance': return <Maintenance role={user!.role} records={maintenance.filter(m => user!.role === UserRole.ADMIN || m.unit === user!.unit)} onPay={(id: string) => setMaintenance(maintenance.map(m => m.id === id ? {...m, status: 'PAID'} : m))} />;
      case 'notices': return <Notices notices={notices} role={user!.role} addNotice={addNotice} />;
      case 'complaints': return <Complaints role={user!.role} complaints={user!.role === UserRole.ADMIN ? complaints : complaints.filter(c => c.residentId === user!.id)} addComplaint={addComplaint} updateStatus={(id: string, status: any) => setComplaints(complaints.map(c => c.id === id ? {...c, status} : c))} />;
      case 'staff': return <Staff staff={staff} role={user!.role} deleteStaff={(id: string) => setStaff(staff.filter(s => s.id !== id))} />;
      default: return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 mx-auto shadow-lg">S</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SocietySync</h1>
          <p className="text-slate-500 mb-8">Login to your smart community</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email (admin@society.com)" className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);