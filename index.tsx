
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

// --- TYPES ---
enum UserRole {
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT'
}

interface User {
  id: string;
  name: string;
  unit: string;
  role: UserRole;
  email: string;
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

// --- CONSTANTS ---
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Doe', unit: 'A-101', role: UserRole.RESIDENT, email: 'john@example.com' },
  { id: 'u2', name: 'Admin Jane', unit: 'Office', role: UserRole.ADMIN, email: 'admin@society.com' },
];

const INITIAL_NOTICES: Notice[] = [
  { 
    id: 'n1', 
    title: 'Elevator Maintenance', 
    content: 'Elevator in Block B will be under maintenance tomorrow from 10 AM to 2 PM.', 
    date: '2023-11-20', 
    priority: 'HIGH', 
    author: 'Management' 
  },
  { 
    id: 'n2', 
    title: 'Water Supply Shutdown', 
    content: 'Scheduled cleaning of the overhead tank this Sunday. Water supply will be interrupted.', 
    date: '2023-11-21', 
    priority: 'MEDIUM', 
    author: 'Admin' 
  }
];

const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm1', unit: 'A-101', amount: 2500, dueDate: '2023-11-05', status: 'PAID', month: 'November', paidDate: '2023-11-02' },
  { id: 'm2', unit: 'A-101', amount: 2500, dueDate: '2023-10-05', status: 'PAID', month: 'October', paidDate: '2023-10-04' },
  { id: 'm3', unit: 'A-102', amount: 2500, dueDate: '2023-11-05', status: 'PENDING', month: 'November' },
  { id: 'm4', unit: 'B-205', amount: 2500, dueDate: '2023-10-05', status: 'OVERDUE', month: 'October' },
];

const INITIAL_COMPLAINTS: Complaint[] = [
  { 
    id: 'c1', 
    title: 'Water Leakage', 
    description: 'There is a major water leakage in the ceiling of my kitchen.', 
    category: 'Plumbing', 
    status: 'OPEN', 
    residentId: 'u1', 
    residentName: 'John Doe', 
    unit: 'A-101', 
    createdAt: '2023-11-18', 
    aiPriority: 'Urgent', 
    aiSummary: 'Ceiling leakage in kitchen needs immediate plumbing attention.' 
  }
];

// --- AI SERVICES ---
const getAIClient = () => new GoogleGenAI({ apiKey: window.process?.env?.API_KEY || '' });

async function analyzeComplaintAI(description: string) {
  try {
    const ai = getAIClient();
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
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return { priority: 'Medium', summary: description.substring(0, 50) + '...' };
  }
}

async function generateNoticeAI(topic: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a professional and polite notice for a housing society about: "${topic}". Include a clear heading and specific instructions.`,
    });
    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("AI Notice Generation failed:", error);
    return "Failed to generate content. Please write manually.";
  }
}

// --- SUB-COMPONENTS ---

const Sidebar = ({ role, activeTab, setActiveTab, onLogout }: any) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'maintenance', label: 'Maintenance', icon: '💰' },
    { id: 'notices', label: 'Notices', icon: '📢' },
    { id: 'complaints', label: 'Complaints', icon: '🛠️' },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white min-h-screen flex flex-col p-4 shrink-0 hidden lg:flex">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-inner">S</div>
        <h1 className="text-xl font-bold tracking-tight">SocietySync</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === tab.id ? 'bg-indigo-700 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-800'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-indigo-800">
        <div className="px-4 py-3 bg-indigo-800/50 rounded-xl mb-4">
          <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Account</p>
          <p className="text-sm font-medium mt-1 truncate">
            {role === UserRole.ADMIN ? 'Administrator' : 'Resident'}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-200 hover:bg-red-500/20 hover:text-red-400 transition-all"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ maintenance, complaints, notices }: any) => {
  const stats = [
    { label: 'Unpaid Bills', value: maintenance.filter((m: any) => m.status !== 'PAID').length, icon: '💸', color: 'bg-red-100 text-red-600' },
    { label: 'Pending Complaints', value: complaints.filter((c: any) => c.status !== 'RESOLVED').length, icon: '🛠️', color: 'bg-orange-100 text-orange-600' },
    { label: 'Active Notices', value: notices.length, icon: '📢', color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Units', value: '120', icon: '🏢', color: 'bg-indigo-100 text-indigo-600' },
  ];

  const chartData = [
    { name: 'Aug', amount: 4000 },
    { name: 'Sep', amount: 3000 },
    { name: 'Oct', amount: 5000 },
    { name: 'Nov', amount: 4500 },
  ];

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
        <p className="text-slate-500">Managing your community is easier than ever.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>{stat.icon}</div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Maintenance Collection Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#6366f1' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Notice Snippet</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              {notices[0]?.content.substring(0, 150)}...
            </p>
          </div>
          <div className="mt-8 relative z-10">
            <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              View All Notices
            </button>
          </div>
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

const Maintenance = ({ role, records, onPay }: any) => {
  const [filter, setFilter] = useState('ALL');
  const isAdmin = role === UserRole.ADMIN;
  const filtered = records.filter((r: any) => filter === 'ALL' || r.status === filter);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Maintenance Records</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Bill Period</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((record: any) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{record.month} 2023</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{record.unit}</td>
                  <td className="px-6 py-4 text-slate-900 font-bold">₹{record.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      record.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      record.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {record.status !== 'PAID' && !isAdmin && (
                      <button
                        onClick={() => onPay(record.id)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                      >
                        Pay Now
                      </button>
                    )}
                    {record.status === 'PAID' && (
                      <span className="text-slate-400 text-sm">Receipt Issued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Notices = ({ role, notices, addNotice }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const content = await generateNoticeAI(topic);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const handlePublish = () => {
    addNotice({
      title: topic,
      content: generatedContent,
      priority: 'MEDIUM',
      date: new Date().toISOString().split('T')[0],
      author: 'Admin'
    });
    setIsModalOpen(false);
    setTopic('');
    setGeneratedContent('');
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Notice Board</h2>
        {role === UserRole.ADMIN && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
          >
            <span>✨</span> Create Notice
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.map((notice: any) => (
          <div key={notice.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
            <div className="flex items-start justify-between mb-4">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                notice.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                notice.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {notice.priority}
              </span>
              <span className="text-xs text-slate-400 font-medium">{notice.date}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{notice.title}</h3>
            <p className="text-slate-600 text-sm whitespace-pre-wrap">{notice.content}</p>
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">By {notice.author}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">AI Notice Draftsman</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-6">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic: Lift Repair, Party, Water Cleaning..."
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none"
              />
              {generatedContent ? (
                <textarea
                  rows={8}
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none resize-none"
                />
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {isGenerating ? 'Gemini is writing...' : 'Generate Content with AI ✨'}
                </button>
              )}
              {generatedContent && (
                <div className="flex gap-4">
                  <button onClick={handlePublish} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Publish</button>
                  <button onClick={() => setGeneratedContent('')} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">Try Again</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Complaints = ({ role, complaints, addComplaint, updateStatus }: any) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isAdmin = role === UserRole.ADMIN;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsAnalyzing(true);
    const analysis = await analyzeComplaintAI(description);
    addComplaint({
      title: description.substring(0, 30) + '...',
      description,
      aiPriority: analysis.priority,
      aiSummary: analysis.summary
    });
    setIsFormOpen(false);
    setDescription('');
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Complaint Register</h2>
        {!isAdmin && (
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700"
          >
            {isFormOpen ? 'Cancel' : 'New Complaint'}
          </button>
        )}
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-4">
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your concern (e.g., Leaking pipe in bathroom A-101)..."
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 outline-none resize-none"
          />
          <button
            disabled={isAnalyzing}
            className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {isAnalyzing ? 'AI Analyzing Priority...' : 'Submit with AI Review'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {complaints.map((c: any) => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                  c.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {c.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">{c.createdAt}</span>
                {c.aiPriority && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-bold">
                    AI Priority: {c.aiPriority}
                  </span>
                )}
              </div>
              <p className="text-slate-800 font-bold mb-1">{c.residentName} (Unit {c.unit})</p>
              <p className="text-slate-600 text-sm italic">"{c.aiSummary || c.description}"</p>
            </div>
            {isAdmin && c.status !== 'RESOLVED' && (
              <button
                onClick={() => updateStatus(c.id, 'RESOLVED')}
                className="px-6 py-2 bg-green-50 text-green-600 rounded-lg font-bold text-sm hover:bg-green-100"
              >
                Resolve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
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
      alert("Try 'admin@society.com' or 'john@example.com'");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('society_user');
  };

  const addNotice = (notice: Partial<Notice>) => {
    const newNotice: Notice = {
      id: Date.now().toString(),
      title: notice.title || 'Untitled',
      content: notice.content || '',
      date: notice.date || 'Today',
      priority: notice.priority || 'MEDIUM',
      author: 'Management'
    };
    setNotices([newNotice, ...notices]);
  };

  const addComplaint = (complaint: Partial<Complaint>) => {
    if (!user) return;
    const newComplaint: Complaint = {
      id: Date.now().toString(),
      title: complaint.title || 'Issue',
      description: complaint.description || '',
      category: 'General',
      status: 'OPEN',
      residentId: user.id,
      residentName: user.name,
      unit: user.unit,
      createdAt: 'Today',
      aiPriority: complaint.aiPriority,
      aiSummary: complaint.aiSummary
    };
    setComplaints([newComplaint, ...complaints]);
  };

  const updateStatus = (id: string, s: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: s } : c));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-in">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg">S</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">SocietySync</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input
                required
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="john@example.com or admin@society.com"
                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-indigo-100 shadow-xl transition-all">Sign In</button>
          </form>
          <p className="mt-8 text-center text-xs text-slate-400">Default Accounts: admin@society.com | john@example.com</p>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard maintenance={maintenance} complaints={complaints} notices={notices} />;
      case 'maintenance': return (
        <Maintenance 
          role={user.role} 
          records={user.role === UserRole.ADMIN ? maintenance : maintenance.filter((m: any) => m.unit === user.unit)} 
          onPay={(id: string) => {
            setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: 'PAID' } : m));
            alert("Payment Recorded Successfully!");
          }}
        />
      );
      case 'notices': return <Notices role={user.role} notices={notices} addNotice={addNotice} />;
      case 'complaints': return (
        <Complaints 
          role={user.role} 
          complaints={user.role === UserRole.ADMIN ? complaints : complaints.filter((c: any) => c.residentId === user.id)} 
          addComplaint={addComplaint} 
          updateStatus={updateStatus}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderTab()}
        </div>
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
