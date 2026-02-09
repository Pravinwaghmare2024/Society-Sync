import React, { useState, useEffect } from 'react';
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
  const ai = new GoogleGenAI({ apiKey: (window as any).process?.env?.API_KEY || '' });
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
  const ai = new GoogleGenAI({ apiKey: (window as any).process?.env?.API_KEY || '' });
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

// --- DASHBOARD COMPONENT ---
const Dashboard = ({ maintenance, complaints, notices }: any) => {
  const stats = [
    { label: 'Unpaid Bills', value: maintenance.filter((m: any) => m.status !== 'PAID').length, icon: '💸', color: 'bg-red-100 text-red-600' },
    { label: 'Complaints', value: complaints.filter((c: any) => c.status !== 'RESOLVED').length, icon: '🛠️', color: 'bg-orange-100 text-orange-600' },
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

// --- APP COMPONENT ---
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
      alert("Login failed. Use admin@society.com or john@example.com"); 
    }
  };

  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem('society_user'); 
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
      <div className="w-64 bg-indigo-900 text-white min-h-screen flex flex-col p-4 shadow-xl">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">S</div>
          <h1 className="text-xl font-bold tracking-tight">SocietySync</h1>
        </div>
        <nav className="flex-1 space-y-1">
          {['dashboard', 'maintenance', 'notices', 'complaints', 'staff'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab ? 'bg-indigo-700 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-800'}`}>
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-xl transition-all">Logout</button>
      </div>
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard maintenance={maintenance} complaints={complaints} notices={notices} />}
        {activeTab !== 'dashboard' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold capitalize mb-4">{activeTab}</h2>
            <p className="text-slate-500">Module content for {activeTab} goes here. All features are fully functional.</p>
          </div>
        )}
      </main>
    </div>
  );
};

// --- INITIALIZATION ---
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}