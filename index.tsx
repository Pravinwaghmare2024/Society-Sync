import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/** ==========================================
 *  1. ENTERPRISE TYPE DEFINITIONS
 *  ========================================== */

const UserRole = { ADMIN: 'ADMIN', RESIDENT: 'RESIDENT' } as const;
type UserRole = typeof UserRole[keyof typeof UserRole];

const StaffRole = { CLEANING: 'Cleaning', PLUMBING: 'Plumbing', ELECTRICAL: 'Electrical', SECURITY: 'Security' } as const;
type StaffRole = typeof StaffRole[keyof typeof StaffRole];

interface UserDocument {
  type: 'AADHAR' | 'POLICE_VERIFICATION' | 'RENT_AGREEMENT';
  status: 'MISSING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';
  fileName?: string;
}

interface User {
  id: string; societyId: string; name: string; username: string; password?: string; unit: string; role: UserRole; email: string; residencyType?: 'OWNER' | 'TENANT'; documents?: UserDocument[];
}

interface StaffMember {
  id: string; societyId: string; name: string; phone: string; role: StaffRole; allocatedFloors: number[]; availability: string;
}

interface MaintenanceRecord {
  id: string; societyId: string; unit: string; amount: number; dueDate: string; status: 'PAID' | 'PENDING' | 'OVERDUE' | 'AWAITING_APPROVAL'; month: string; paidDate?: string; transactionId?: string;
}

interface Notice {
  id: string; societyId: string; title: string; content: string; date: string; priority: 'LOW' | 'MEDIUM' | 'HIGH'; author: string;
}

interface Complaint {
  id: string; societyId: string; title: string; description: string; category: string; status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'; residentName: string; unit: string; createdAt: string; aiPriority?: string; aiSummary?: string;
}

interface SocietySettings {
  id: string; code: string; name: string; address: string; registrationNo: string; gstNumber: string; baseMaintenance: number;
}

/** ==========================================
 *  2. GLOBAL MOCK DATA
 *  ========================================== */

const DEFAULT_SOCIETY: SocietySettings = { 
  id: 'soc_1', 
  code: 'GVR_001', 
  name: 'Grand View Residency', 
  address: '123 Sky Lane, Sector 45',
  registrationNo: 'MS/2023/1234',
  gstNumber: '27AAAAA0000A1Z5',
  baseMaintenance: 2500
};

const MOCK_USERS: User[] = [
  { id: 'u1', societyId: 'soc_1', name: 'John Resident', username: 'john', password: 'password123', unit: 'A-101', role: UserRole.RESIDENT, email: 'john@example.com', residencyType: 'OWNER', documents: [] },
  { id: 'u2', societyId: 'soc_1', name: 'Admin Jane', username: 'admin', password: 'admin123', unit: 'Office', role: UserRole.ADMIN, email: 'admin@society.com', residencyType: 'OWNER', documents: [] }
];

const MOCK_MAINTENANCE: MaintenanceRecord[] = [
  { id: 'm1', societyId: 'soc_1', unit: 'A-101', amount: 2500, dueDate: '2023-11-05', status: 'PAID', month: 'November', paidDate: '2023-11-02' },
  { id: 'm3', societyId: 'soc_1', unit: 'A-102', amount: 2500, dueDate: '2023-11-05', status: 'PENDING', month: 'November' }
];

const MOCK_STAFF: StaffMember[] = [
  { id: 's1', societyId: 'soc_1', name: 'Ramesh Kumar', role: StaffRole.CLEANING, phone: '+91 98765 00001', allocatedFloors: [1, 2, 3], availability: '08:00 AM - 04:00 PM' }
];

/** ==========================================
 *  3. CORE APPLICATION ENGINE
 *  ========================================== */

const LoginPage = ({ societies, allUsers, onLoginSuccess }: { societies: SocietySettings[], allUsers: User[], onLoginSuccess: (u: User, s: SocietySettings) => void }) => {
  const [code, setCode] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const society = societies.find(s => s.code.toUpperCase() === code.trim().toUpperCase());
    if (!society) return setError("Invalid Society Code");
    const found = allUsers.find(u => u.username === user && u.password === pass && u.societyId === society.id);
    if (!found) return setError("Invalid Credentials");
    onLoginSuccess(found, society);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white mb-8 shadow-xl shadow-indigo-100">S</div>
        <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">SocietySync</h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10">Enterprise Access Gateway</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100">{error}</div>}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Society ID</label>
            <input required placeholder="GVR_001" value={code} onChange={e => setCode(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 uppercase" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <input required placeholder="Resident ID" value={user} onChange={e => setUser(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Credential Secret</label>
            <input required type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-50 mt-4">Authenticate</button>
        </form>
        <p className="mt-8 text-[9px] text-slate-300 text-center font-medium">Demo: GVR_001 | admin | admin123</p>
      </div>
    </div>
  );
};

const MainApp = ({ user: initialUser, society, onLogout, allUsers: initialAllUsers }: { user: User, society: SocietySettings, onLogout: () => void, allUsers: User[] }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(initialUser);
  const [allUsers, setAllUsers] = useState<User[]>(initialAllUsers);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const isAdmin = user.role === UserRole.ADMIN;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'maintenance', label: 'Payments', icon: '💰' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'complaints', label: 'Helpdesk', icon: '🛠️' },
    { id: 'notices', label: 'Notices', icon: '📢' },
    { id: 'staff', label: 'Staff Hub', icon: '👷' },
    ...(isAdmin ? [
      { id: 'settings', label: 'Settings', icon: '⚙️' },
      { id: 'installation', label: 'Install Guide', icon: '📜' }
    ] : [])
  ];

  const handleUpdateDocuments = (uid: string, docs: UserDocument[]) => {
    setAllUsers(prev => prev.map(u => u.id === uid ? { ...u, documents: docs } : u));
    if (user.id === uid) {
      setUser(prev => ({ ...prev, documents: docs }));
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <aside className="w-72 bg-slate-900 m-4 rounded-[2.5rem] p-8 text-white flex flex-col shadow-2xl relative z-50">
        <div className="mb-14 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">S</div>
          <div>
            <h2 className="text-xl font-black tracking-tighter">SocietySync</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Enterprise v3.0</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
              <span className="text-lg">{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col gap-4">
          <div className="bg-slate-800/50 p-4 rounded-2xl">
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Role</p>
             <p className="text-xs font-bold">{isAdmin ? 'Administrator' : 'Resident Portal'}</p>
          </div>
          <button onClick={onLogout} className="w-full p-4 text-rose-400 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/10 rounded-2xl transition-all">Terminate Session</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto h-screen custom-scrollbar">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{society.name} • Unit {user.unit}</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center gap-5 bg-white p-3 pr-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shadow-lg">{user.name[0]}</div>
            <div>
              <p className="text-sm font-black text-slate-900">{user.name}</p>
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
                {user.residencyType === 'OWNER' ? 'Flat Owner' : 'Rented (Tenant)'}
              </p>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Unpaid Dues', val: `₹${maintenance.filter(m => m.status !== 'PAID').reduce((a,c) => a+c.amount, 0)}`, icon: '💸' },
                  { label: 'Open Tickets', val: '0', icon: '🛠️' },
                  { label: 'Staff Online', val: staff.length, icon: '👷' },
                  { label: 'Total Units', val: '120', icon: '🏢' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{s.label}</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{s.val}</h3>
                      <span className="text-2xl opacity-40">{s.icon}</span>
                    </div>
                  </div>
                ))}
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h3 className="font-black text-slate-900 text-lg mb-8 uppercase tracking-widest text-[11px]">Payment Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{n:'Sep', a:5000}, {n:'Oct', a:3000}, {n:'Nov', a:7500}]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize:10, fontWeight:700}} />
                        <Bar dataKey="a" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-indigo-600 p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl shadow-indigo-100 relative overflow-hidden">
                   <div className="relative z-10">
                     <p className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Latest Announcement</p>
                     <h3 className="text-2xl font-black leading-tight mb-4">Annual General Body Meeting</h3>
                     <p className="text-indigo-100 text-sm opacity-80 font-medium">Scheduled for this Sunday at 10:30 AM in the Community Hall. All residents requested to attend.</p>
                   </div>
                   <button className="relative z-10 bg-white text-indigo-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-8">Read Full Notice</button>
                   <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr><th className="p-8">Period</th><th className="p-8">Unit</th><th className="p-8">Amount</th><th className="p-8">Status</th><th className="p-8">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {maintenance.filter(m => isAdmin || m.unit === user.unit).map(m => (
                  <tr key={m.id} className="text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors">
                    <td className="p-8 font-black">{m.month} 2023</td>
                    <td className="p-8 text-slate-500">{m.unit}</td>
                    <td className="p-8 font-black text-lg">₹{m.amount}</td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${m.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-8">
                      {m.status !== 'PAID' ? <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Pay Now</button> : <button className="text-indigo-600 text-xs font-black uppercase tracking-widest">Download Receipt</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Document Vault</h2>
                <p className="text-slate-500">Compliance documents for {user.residencyType === 'OWNER' ? 'Flat Owner' : 'Rented'} residency.</p>
              </div>
            </div>

            {isAdmin ? (
               <div className="grid grid-cols-1 gap-6">
                 {allUsers.filter(u => (u.documents?.length || 0) > 0).map(u => (
                   <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h4 className="font-black text-slate-900">{u.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit {u.unit} • {u.residencyType === 'OWNER' ? 'Flat Owner' : 'Rented'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {u.documents?.map(d => (
                          <div key={d.type} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">📄</div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{d.type.replace(/_/g, ' ')}</p>
                              <p className="text-[10px] font-bold text-slate-900 truncate">{d.status}</p>
                            </div>
                            {d.status === 'UPLOADED' && (
                              <button onClick={() => handleUpdateDocuments(u.id, u.documents?.map(doc => doc.type === d.type ? {...doc, status: 'VERIFIED'} : doc) || [])} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">Verify</button>
                            )}
                          </div>
                        ))}
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['AADHAR', 'POLICE_VERIFICATION', ...(user.residencyType === 'TENANT' ? ['RENT_AGREEMENT'] : [])].map(type => {
                  const doc = user.documents?.find(d => d.type === type);
                  return (
                    <div key={type} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
                      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl mb-8 transition-all ${doc?.status === 'VERIFIED' ? 'bg-green-100 text-green-600' : doc?.status === 'UPLOADED' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                        {type === 'AADHAR' ? '🪪' : type === 'POLICE_VERIFICATION' ? '👮' : '📜'}
                      </div>
                      <h3 className="font-black text-slate-900 mb-2 uppercase text-xs tracking-widest">{type.replace(/_/g, ' ')}</h3>
                      <p className="text-[10px] text-slate-400 mb-8 font-medium italic">
                        {type === 'AADHAR' ? 'Government ID for unit verification' : type === 'POLICE_VERIFICATION' ? 'Mandatory verification for all residents' : 'Registered agreement copy'}
                      </p>
                      
                      {doc?.status === 'VERIFIED' ? (
                        <div className="w-full bg-green-50 text-green-700 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest">Verified ✓</div>
                      ) : doc?.status === 'UPLOADED' ? (
                        <div className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest">Awaiting Review</div>
                      ) : (
                        <button onClick={() => handleUpdateDocuments(user.id, [...(user.documents || []), { type: type as any, status: 'UPLOADED', fileName: `${type.toLowerCase()}.pdf` }])} className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700">Upload Now</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'staff' && (
           <div className="space-y-8">
              <div className="flex justify-between items-center">
                <p className="text-slate-500 font-medium">Allocated facility management staff for {society.name}.</p>
                {isAdmin && <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Add Staff</button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {staff.map(s => (
                   <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className="flex items-center gap-5 mb-8">
                         <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">👷</div>
                         <div>
                            <h4 className="text-lg font-black text-slate-900">{s.name}</h4>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{s.role}</p>
                         </div>
                      </div>
                      <div className="space-y-3 mb-8">
                        <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">CONTACT</span> <span>{s.phone}</span></div>
                        <div className="flex justify-between text-xs font-bold"><span className="text-slate-400">AVAILABILITY</span> <span>{s.availability}</span></div>
                      </div>
                      <a href={`tel:${s.phone}`} className="block w-full text-center bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Call Now</a>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'settings' && isAdmin && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Enterprise Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Society Legal Name</label>
                    <input defaultValue={society.name} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Society Access Code</label>
                    <input disabled defaultValue={society.code} className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none cursor-not-allowed opacity-50" />
                  </div>
              </div>
              <div className="mt-12 pt-10 border-t border-slate-50 flex justify-end gap-4">
                  <button onClick={() => alert("Settings Persistent in Memory")} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100">Commit Changes</button>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Add New Resident</h3>
              <form className="grid grid-cols-1 md:grid-cols-3 gap-6" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newUser: User = {
                  id: 'u_' + Date.now(),
                  societyId: society.id,
                  name: formData.get('name') as string,
                  username: formData.get('username') as string,
                  unit: formData.get('unit') as string,
                  role: UserRole.RESIDENT,
                  email: formData.get('email') as string,
                  residencyType: formData.get('residencyType') as 'OWNER' | 'TENANT',
                  documents: []
                };
                setAllUsers(prev => [...prev, newUser]);
                alert("Resident added to directory.");
                (e.target as HTMLFormElement).reset();
              }}>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input name="name" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                  <input name="username" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit</label>
                  <input name="unit" required placeholder="A-101" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Residency Status</label>
                  <select name="residencyType" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none">
                    <option value="OWNER">Flat Owner</option>
                    <option value="TENANT">Rented (Tenant)</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-end">
                  <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Add Resident</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'installation' && isAdmin && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100">
               <h3 className="text-2xl font-black text-slate-900 mb-4">Windows Server / IIS Setup</h3>
               <p className="text-slate-500 mb-8 leading-relaxed font-medium">To run SocietySync in a production IIS environment, follow these strict configuration steps.</p>
               <div className="space-y-6">
                  <div className="flex gap-6 items-start">
                     <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shrink-0">01</div>
                     <div>
                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">MIME Mapping</h4>
                        <p className="text-sm text-slate-500 font-medium">Ensure <strong>.ts</strong> and <strong>.tsx</strong> are mapped to <code>application/javascript</code> in IIS Manager.</p>
                     </div>
                  </div>
                  <div className="flex gap-6 items-start">
                     <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shrink-0">02</div>
                     <div>
                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">URL Rewrite</h4>
                        <p className="text-sm text-slate-500 font-medium">Install the Microsoft URL Rewrite 2.1 module to enable SPA routing via the <code>web.config</code>.</p>
                     </div>
                  </div>
               </div>
               <div className="mt-10 p-6 bg-slate-900 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">web.config snippet</p>
                  <pre className="text-indigo-300 text-[10px] font-mono leading-relaxed overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>`}
                  </pre>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [society, setSociety] = useState<SocietySettings>(DEFAULT_SOCIETY);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);

  if (!user) return <LoginPage societies={[DEFAULT_SOCIETY]} allUsers={allUsers} onLoginSuccess={(u, s) => { setUser(u); setSociety(s); }} />;
  return <MainApp user={user} society={society} allUsers={allUsers} onLogout={() => setUser(null)} />;
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
}