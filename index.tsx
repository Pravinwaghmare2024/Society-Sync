
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

// --- TYPES & INTERFACES ---
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT'
}

enum OccupancyType {
  OWNED = 'OWNED',
  RENTED = 'RENTED'
}

enum ComplianceStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  EXPIRED = 'EXPIRED'
}

interface EmergencyContact {
  id: string;
  role: string;
  name: string;
  phone: string;
}

interface SocietyConfig {
  name: string;
  address: string;
  maintenanceRate: number; // Rate per SqFt
  lateFee: number;
  currency: string;
  totalBlocks: number;
  totalFloors: number;
  gymTimings: string;
  clubhouseRules: string;
  emergencyContacts: EmergencyContact[];
}

interface User {
  id: string;
  name: string;
  unit: string;
  role: UserRole;
  email: string;
  occupancyType: OccupancyType;
  agreementDate?: string;
  policeVerification: ComplianceStatus;
  pvDate?: string;
  areaOwned: number; 
  parkingSlot: string;
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
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  residentName: string;
  unit: string;
  createdAt: string;
  aiPriority?: string;
  aiSummary?: string;
}

// --- CONSTANTS & MOCK DATA ---
const DEFAULT_CONFIG: SocietyConfig = {
  name: "Grand View Residency",
  address: "Plot 42, Skyline Drive, Mumbai",
  maintenanceRate: 3.5,
  lateFee: 250,
  currency: "₹",
  totalBlocks: 4,
  totalFloors: 12,
  gymTimings: "06:00 AM - 10:00 PM",
  clubhouseRules: "Prior booking required. No external guests after 8 PM.",
  emergencyContacts: [
    { id: '1', role: 'Security Head', name: 'Commander Roy', phone: '+91 98765 43210' },
    { id: '2', role: 'Plumber', name: 'Ramesh Singh', phone: '+91 98234 56789' }
  ]
};

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Doe', unit: 'A-101', role: UserRole.RESIDENT, email: 'john@example.com', occupancyType: OccupancyType.OWNED, policeVerification: ComplianceStatus.VERIFIED, pvDate: '2023-05-12', areaOwned: 1250, parkingSlot: 'P-101' },
  { id: 'u2', name: 'Sarah Miller', unit: 'B-205', role: UserRole.RESIDENT, email: 'sarah@example.com', occupancyType: OccupancyType.RENTED, agreementDate: '2023-10-01', policeVerification: ComplianceStatus.PENDING, areaOwned: 850, parkingSlot: 'P-205' },
  { id: 'u3', name: 'Admin Jane', unit: 'Office-1', role: UserRole.ADMIN, email: 'admin@society.com', occupancyType: OccupancyType.OWNED, policeVerification: ComplianceStatus.VERIFIED, areaOwned: 0, parkingSlot: 'NA' },
  { id: 'u4', name: 'Super Manager', unit: 'HQ', role: UserRole.SUPER_ADMIN, email: 'super@system.com', occupancyType: OccupancyType.OWNED, policeVerification: ComplianceStatus.VERIFIED, areaOwned: 0, parkingSlot: 'NA' },
];

// --- AI SERVICES ---
const analyzeComplaintAI = async (description: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following housing society complaint and provide a priority (Urgent, Medium, Low) and a short summary: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING, description: 'Urgent, Medium, or Low' },
            summary: { type: Type.STRING, description: 'A one-sentence summary of the issue.' },
          },
          required: ["priority", "summary"],
        },
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return { priority: 'Medium', summary: description.substring(0, 50) + '...' };
  }
};

const generateNoticeAI = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a professional and polite notice for a housing society about: "${topic}". Include a clear heading and specific instructions.`,
    });
    return response.text || "Draft failed to generate.";
  } catch (error) {
    console.error("AI Generation failed:", error);
    return "Generation error.";
  }
};

// --- SUB-COMPONENTS ---

const Sidebar = ({ user, activeTab, setActiveTab, onLogout }: any) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RESIDENT] },
    { id: 'units', label: 'Units & Assets', icon: '🏢', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { id: 'maintenance', label: 'Finance', icon: '💰', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RESIDENT] },
    { id: 'notices', label: 'Notice Board', icon: '📢', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RESIDENT] },
    { id: 'complaints', label: 'Complaints', icon: '🛠️', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RESIDENT] },
    { id: 'setup', label: 'System Setup', icon: '⚙️', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
  ];

  return (
    <div className="w-72 bg-slate-900 text-white min-h-screen flex flex-col p-6 shrink-0 border-r border-slate-800">
      <div className="mb-12 flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">S</div>
        <div>
          <h1 className="text-xl font-bold">SocietySync</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise Suite</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {tabs.filter(t => t.roles.includes(user.role)).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="font-semibold">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-800">
        <div className="p-4 bg-slate-800/50 rounded-2xl mb-4 border border-slate-700/50">
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">{user.role}</p>
          <p className="text-sm font-bold truncate">{user.name}</p>
          <p className="text-xs text-slate-500">{user.unit}</p>
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all">
          <span className="text-xl">🚪</span>
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ config, maintenance, complaints, notices, user }: any) => {
  const chartData = [
    { n: 'Sep', a: 2500 }, { n: 'Oct', a: 3200 }, { n: 'Nov', a: 4100 }, { n: 'Dec', a: 3800 }
  ];

  const stats = [
    { label: 'Unpaid Bills', value: maintenance.filter((m: any) => m.status !== 'PAID').length, icon: '💸', color: 'bg-rose-50 text-rose-600' },
    { label: 'Pending Complaints', value: complaints.filter((c: any) => c.status !== 'RESOLVED').length, icon: '🛠️', color: 'bg-amber-50 text-amber-600' },
    { label: 'Active Notices', value: notices.length, icon: '📢', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Managed Area', value: '54,200', icon: '📐', color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="space-y-10 animate-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{config.name}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-1">{config.address}</p>
        </div>
        <div className="bg-white border border-slate-100 p-2 rounded-2xl flex items-center gap-4 shadow-sm">
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs">DEC 2023</div>
           <div className="pr-4 text-xs font-bold text-slate-400">Inventory Status: Healthy</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:-translate-y-2 transition-all">
            <div className={`w-14 h-14 ${s.color} rounded-[1.25rem] flex items-center justify-center text-3xl mb-8`}>{s.icon}</div>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl">
          <h3 className="text-2xl font-black mb-10 tracking-tight text-slate-900">Financial Insights</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="a" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-indigo-600 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col">
          <h3 className="text-2xl font-black mb-8 relative z-10">Asset Detail</h3>
          <div className="space-y-6 relative z-10">
            <div className="bg-white/10 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-1">Unit ID</p>
              <p className="text-3xl font-black">{user.unit}</p>
            </div>
            <div className="p-5 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-1">Parking Slot</p>
              <p className="font-black text-xl">{user.parkingSlot || 'Allotted Soon'}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-400 rounded-full blur-[120px] opacity-30 -translate-y-1/2 translate-x-1/3"></div>
        </div>
      </div>
    </div>
  );
};

const Maintenance = ({ records, onPay, config }: any) => {
  const downloadReceipt = (record: MaintenanceRecord) => {
    const receiptHtml = `
      <html>
        <head>
          <title>Maintenance Receipt - ${record.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .receipt-container { max-width: 600px; margin: auto; border: 2px solid #f1f5f9; padding: 40px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
            .society-name { font-size: 24px; font-weight: 800; color: #4f46e5; margin: 0; }
            .receipt-title { text-transform: uppercase; letter-spacing: 2px; font-size: 12px; font-weight: 700; color: #94a3b8; margin-top: 5px; }
            .details { margin-bottom: 30px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
            .label { font-weight: 600; color: #64748b; }
            .value { font-weight: 800; color: #1e293b; }
            .amount-section { background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; margin-top: 20px; }
            .amount-value { font-size: 32px; font-weight: 900; color: #1e293b; }
            .stamp { width: 100px; height: 100px; border: 4px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #10b981; text-transform: uppercase; transform: rotate(-15deg); margin: 20px auto; opacity: 0.6; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h1 class="society-name">${config.name}</h1>
              <div class="receipt-title">Official Maintenance Receipt</div>
            </div>
            <div class="details">
              <div class="detail-row"><span class="label">Receipt No:</span> <span class="value">REC-${record.id.toUpperCase()}</span></div>
              <div class="detail-row"><span class="label">Unit Number:</span> <span class="value">${record.unit}</span></div>
              <div class="detail-row"><span class="label">Billing Month:</span> <span class="value">${record.month} 2023</span></div>
              <div class="detail-row"><span class="label">Payment Date:</span> <span class="value">${record.paidDate || 'N/A'}</span></div>
            </div>
            <div class="amount-section"><div class="amount-value">${config.currency}${record.amount.toLocaleString()}</div></div>
            <div class="stamp">PAID</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `Receipt_${record.unit}_${record.month}.html`;
    link.click();
  };

  return (
    <div className="space-y-8 animate-in">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Ledger</h2>
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden shadow-slate-200/20">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-10 py-7">Period</th>
              <th className="px-10 py-7">Unit</th>
              <th className="px-10 py-7 text-right">Amount</th>
              <th className="px-10 py-7 text-center">Status</th>
              <th className="px-10 py-7 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.map((m: any) => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-all">
                <td className="px-10 py-7 font-black text-slate-900">{m.month} 2023</td>
                <td className="px-10 py-7"><span className="font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg text-xs">{m.unit}</span></td>
                <td className="px-10 py-7 text-right font-black text-slate-900 text-lg">{config.currency}{m.amount.toLocaleString()}</td>
                <td className="px-10 py-7 text-center">
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase ${m.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-10 py-7 text-right">
                  {m.status === 'PENDING' && <button onClick={() => onPay(m.id)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all">PAY NOW</button>}
                  {m.status === 'PAID' && <button onClick={() => downloadReceipt(m)} className="text-[10px] font-black text-indigo-500 hover:underline">RECEIPT 📄</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Complaints = ({ complaints, onAdd, onUpdateStatus, role }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsAnalyzing(true);
    const analysis = await analyzeComplaintAI(desc);
    onAdd({ description: desc, aiPriority: analysis.priority, aiSummary: analysis.summary });
    setDesc('');
    setIsOpen(false);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8 animate-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900">Complaint Register</h2>
        {role === UserRole.RESIDENT && (
          <button onClick={() => setIsOpen(!isOpen)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/30 hover:bg-indigo-700">
            {isOpen ? 'Close Form' : 'File Complaint'}
          </button>
        )}
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Describe the Issue</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} required className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl p-6 font-bold outline-none h-40" placeholder="e.g. Water leak in A-Block lobby..." />
          <button disabled={isAnalyzing} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg disabled:opacity-50">
            {isAnalyzing ? 'AI ANALYZING PRIORITY...' : 'SUBMIT WITH AI TRIAGE'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {complaints.map((c: any) => (
          <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">AI Priority: {c.aiPriority || 'Medium'}</span>
              </div>
              <p className="font-bold text-slate-900 text-lg mb-1">{c.aiSummary || c.description}</p>
              <p className="text-sm text-slate-400 font-medium">Reported by {c.residentName} ({c.unit}) • {c.createdAt}</p>
            </div>
            {role !== UserRole.RESIDENT && c.status !== 'RESOLVED' && (
              <button onClick={() => onUpdateStatus(c.id, 'RESOLVED')} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all">MARK RESOLVED</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SetupConsole = ({ config, setConfig }: { config: SocietyConfig, setConfig: (c: SocietyConfig) => void }) => {
  const [it, setIt] = useState('general');
  return (
    <div className="space-y-8 animate-in">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">System Console</h2>
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {['general', 'finance', 'facilities'].map(tab => (
          <button key={tab} onClick={() => setIt(tab)} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${it === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{tab}</button>
        ))}
      </div>
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12">
        {it === 'general' && (
          <div className="col-span-2 space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Society Name</label>
              <input type="text" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Blocks</label><input type="number" value={config.totalBlocks} onChange={e => setConfig({...config, totalBlocks: +e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 font-bold" /></div>
              <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Floors</label><input type="number" value={config.totalFloors} onChange={e => setConfig({...config, totalFloors: +e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 font-bold" /></div>
            </div>
          </div>
        )}
        {it === 'finance' && (
          <div className="col-span-2 space-y-6">
            <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Maint. Rate (per sqft)</label><input type="number" value={config.maintenanceRate} onChange={e => setConfig({...config, maintenanceRate: +e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 font-bold" /></div>
            <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Currency</label><input type="text" value={config.currency} onChange={e => setConfig({...config, currency: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 font-bold" /></div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [config, setConfig] = useState<SocietyConfig>(DEFAULT_CONFIG);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loginEmail, setLoginEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('societysync_full_v1');
    if (saved) {
      const p = JSON.parse(saved);
      setMaintenance(p.maintenance);
      setComplaints(p.complaints);
      setNotices(p.notices);
      setConfig(p.config || DEFAULT_CONFIG);
    } else {
      setMaintenance([
        { id: 'm1', unit: 'A-101', amount: 4375, dueDate: '2023-12-15', status: 'PENDING', month: 'December' },
        { id: 'm2', unit: 'B-205', amount: 2975, dueDate: '2023-11-15', status: 'PAID', month: 'November', paidDate: '2023-11-10' }
      ]);
      setNotices([
        { id: 'n1', title: 'Parking Cleaning', content: 'Painting works start Monday in Block A.', date: '2023-12-01', priority: 'MEDIUM', author: 'Admin' }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('societysync_full_v1', JSON.stringify({ maintenance, complaints, notices, config }));
  }, [maintenance, complaints, notices, config]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (found) { setUser(found); localStorage.setItem('society_active_user', JSON.stringify(found)); }
    else { alert("Unauthorized access. Try demo emails: admin@society.com or john@example.com"); }
  };

  const handleLogout = () => { setUser(null); localStorage.removeItem('society_active_user'); };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard config={config} maintenance={maintenance} complaints={complaints} notices={notices} user={user} />;
      case 'maintenance': return <Maintenance records={maintenance.filter(m => user?.role !== UserRole.RESIDENT || m.unit === user.unit)} onPay={(id: any) => setMaintenance(prev => prev.map(m => m.id === id ? {...m, status: 'PAID', paidDate: new Date().toLocaleDateString()} : m))} config={config} />;
      case 'complaints': return <Complaints complaints={user?.role === UserRole.RESIDENT ? complaints.filter(c => c.residentName === user.name) : complaints} onAdd={(c: any) => setComplaints(prev => [{...c, id: Date.now().toString(), status: 'OPEN', residentName: user?.name, unit: user?.unit, createdAt: new Date().toLocaleDateString()}, ...prev])} onUpdateStatus={(id: any, status: any) => setComplaints(prev => prev.map(c => c.id === id ? {...c, status} : c))} role={user?.role} />;
      case 'setup': return <SetupConsole config={config} setConfig={setConfig} />;
      case 'notices': return (
        <div className="space-y-10 animate-in">
          <h2 className="text-3xl font-black text-slate-900">Notice Board</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {notices.map(n => (
              <div key={n.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 inline-block ${n.priority === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>{n.priority}</span>
                <h3 className="text-xl font-black text-slate-900 mb-3">{n.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-6">{n.content}</p>
                <div className="pt-6 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">PUBLISHED BY {n.author} ON {n.date}</div>
              </div>
            ))}
          </div>
        </div>
      );
      default: return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black mb-6 shadow-2xl">S</div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">SocietySync</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Enterprise Resource Planning</p>
          </div>
          <form onSubmit={handleLogin} className="relative z-10 space-y-6">
            <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email Address" className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl px-8 py-5 font-bold outline-none" />
            <button className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all">ENTER PORTAL</button>
          </form>
          <div className="mt-8 text-center text-xs font-bold text-slate-400">Demo Emails: admin@society.com / john@example.com</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fcfdfe]">
      <Sidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 p-8 lg:p-14 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
