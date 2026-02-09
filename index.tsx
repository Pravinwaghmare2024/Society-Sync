import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend
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

enum StaffRole {
  CLEANING = 'CLEANING',
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  SECURITY = 'SECURITY'
}

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  allocatedFloors: number[];
  availability: string;
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
  maintenanceRate: number; 
  lateFee: number;
  currency: string;
  totalBlocks: number;
  totalFloors: number;
  gymTimings: string;
  clubhouseRules: string;
  emergencyContacts: EmergencyContact[];
  requirePoliceVerification: boolean;
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
  ],
  requirePoliceVerification: true
};

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'John Doe', unit: 'A-101', role: UserRole.RESIDENT, email: 'john@example.com', occupancyType: OccupancyType.OWNED, policeVerification: ComplianceStatus.VERIFIED, pvDate: '2023-05-12', areaOwned: 1250, parkingSlot: 'P-101' },
  { id: 'u2', name: 'Sarah Miller', unit: 'B-205', role: UserRole.RESIDENT, email: 'sarah@example.com', occupancyType: OccupancyType.RENTED, agreementDate: '2023-10-01', policeVerification: ComplianceStatus.PENDING, areaOwned: 850, parkingSlot: 'P-205' },
  { id: 'u3', name: 'Admin Jane', unit: 'Office-1', role: UserRole.ADMIN, email: 'admin@society.com', occupancyType: OccupancyType.OWNED, policeVerification: ComplianceStatus.VERIFIED, areaOwned: 0, parkingSlot: 'NA' },
  { id: 'u4', name: 'Super Manager', unit: 'HQ', role: UserRole.SUPER_ADMIN, email: 'super@system.com', occupancyType: OccupancyType.OWNED, policeVerification: ComplianceStatus.VERIFIED, areaOwned: 0, parkingSlot: 'NA' },
];

const MOCK_STAFF: StaffMember[] = [
  { id: 's1', name: 'Ramesh Kumar', role: StaffRole.CLEANING, phone: '+91 98765 11111', allocatedFloors: [1, 2, 3], availability: '08:00 AM - 04:00 PM' },
  { id: 's2', name: 'Suresh Singh', role: StaffRole.CLEANING, phone: '+91 98765 22222', allocatedFloors: [4, 5, 6], availability: '08:00 AM - 04:00 PM' },
  { id: 's3', name: 'Sunita Devi', role: StaffRole.CLEANING, phone: '+91 98765 33333', allocatedFloors: [7, 8, 9, 10], availability: '09:00 AM - 05:00 PM' },
  { id: 's4', name: 'Vijay Electrician', role: StaffRole.ELECTRICAL, phone: '+91 98765 44444', allocatedFloors: [], availability: '24/7 (On Call)' },
  { id: 's5', name: 'Arjun Plumber', role: StaffRole.PLUMBING, phone: '+91 98765 55555', allocatedFloors: [], availability: '10:00 AM - 06:00 PM' },
];

// --- SUB-COMPONENTS ---

const Sidebar = ({ user, activeTab, setActiveTab, onLogout }: any) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RESIDENT] },
    { id: 'units', label: 'Units & Assets', icon: '🏢', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
    { id: 'maintenance', label: 'Finance', icon: '💰', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RESIDENT] },
    { id: 'notices', label: 'Notice Board', icon: '📢', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RESIDENT] },
    { id: 'complaints', label: 'Complaints', icon: '🛠️', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RESIDENT] },
    { id: 'staff', label: 'Staff Directory', icon: '👷', roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RESIDENT] },
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

const SetupView = ({ config, setConfig, onBackup, onRestore, onReset }: { 
  config: SocietyConfig, 
  setConfig: (c: SocietyConfig) => void,
  onBackup: () => void,
  onRestore: (e: React.ChangeEvent<HTMLInputElement>) => void,
  onReset: () => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">System Console</h2>
          <p className="text-slate-500 font-medium">Global configuration, building structure, and database management.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBackup} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2">
            📥 BACKUP DATA
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2">
            📤 RESTORE
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={onRestore} className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">Society Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Legal Society Name</label>
                <input type="text" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registered Address</label>
                <textarea rows={2} value={config.address} onChange={e => setConfig({...config, address: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Currency Symbol</label>
                <input type="text" value={config.currency} onChange={e => setConfig({...config, currency: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl">
                <input type="checkbox" checked={config.requirePoliceVerification} onChange={e => setConfig({...config, requirePoliceVerification: e.target.checked})} className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                <div>
                  <p className="text-xs font-black text-slate-900">Police Verification Mandatory</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">For all rented units</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">Building Topology</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Blocks / Wings</label>
                <input type="number" value={config.totalBlocks} onChange={e => setConfig({...config, totalBlocks: parseInt(e.target.value)})} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Floors per Block</label>
                <input type="number" value={config.totalFloors} onChange={e => setConfig({...config, totalFloors: parseInt(e.target.value)})} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">Financial Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Maintenance Rate (per SqFt)</label>
                <input type="number" step="0.1" value={config.maintenanceRate} onChange={e => setConfig({...config, maintenanceRate: parseFloat(e.target.value)})} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Late Payment Penalty</label>
                <input type="number" value={config.lateFee} onChange={e => setConfig({...config, lateFee: parseInt(e.target.value)})} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <div className="bg-rose-500 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-black mb-6 relative z-10">Danger Zone</h3>
            <p className="text-rose-100 text-sm mb-8 relative z-10 font-medium">Resetting the system will clear all current records, complaints, and configurations from your browser's local storage.</p>
            <button onClick={onReset} className="w-full bg-white text-rose-600 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-rose-50 transition-all relative z-10">
              FACTORY RESET SYSTEM
            </button>
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400 rounded-full blur-[100px] opacity-30 -translate-y-1/2 translate-x-1/3"></div>
          </div>

          <div className="bg-indigo-600 text-white p-10 rounded-[3rem] shadow-2xl">
            <h3 className="text-xl font-black mb-6">Database Health</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center py-3 border-b border-indigo-500/30">
                <span className="text-[10px] font-black uppercase opacity-70">Records Active</span>
                <span className="font-black">1,248</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-indigo-500/30">
                <span className="text-[10px] font-black uppercase opacity-70">Last Sync</span>
                <span className="font-black">2 mins ago</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-[10px] font-black uppercase opacity-70">Integrity</span>
                <span className="font-black text-emerald-300">SECURE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UnitsView = ({ users }: { users: User[] }) => {
  const pieData = useMemo(() => {
    const owned = users.filter(u => u.occupancyType === OccupancyType.OWNED).length;
    const rented = users.filter(u => u.occupancyType === OccupancyType.RENTED).length;
    return [
      { name: 'Owned', value: owned, fill: '#6366f1' },
      { name: 'Rented', value: rented, fill: '#f43f5e' }
    ];
  }, [users]);

  return (
    <div className="space-y-10 animate-in">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Units & Compliance</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Occupancy Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5} />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Resident</th>
                <th className="px-8 py-6">Unit</th>
                <th className="px-8 py-6">Type</th>
                <th className="px-8 py-6">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6 font-bold text-slate-900">{u.name}</td>
                  <td className="px-8 py-6 text-slate-500 font-bold">{u.unit}</td>
                  <td className="px-8 py-6 font-black text-xs">
                    <span className={u.occupancyType === OccupancyType.OWNED ? 'text-indigo-600' : 'text-rose-600'}>
                      {u.occupancyType}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                      u.policeVerification === ComplianceStatus.VERIFIED ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {u.policeVerification}
                    </span>
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

const StaffView = ({ staff, user, onAddStaff }: { staff: StaffMember[], user: User, onAddStaff: (s: StaffMember) => void }) => {
  const [filter, setFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
  
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState(StaffRole.CLEANING);
  const [newAvailability, setNewAvailability] = useState('09:00 AM - 05:00 PM');
  const [newFloors, setNewFloors] = useState('');

  const floorNum = parseInt(user.unit.split('-')[1]?.substring(0, 1)) || 0;

  const filteredStaff = staff.filter(s => {
    if (filter === 'ALL') return true;
    return s.role === filter;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const floorsArray = newFloors.split(',').map(f => parseInt(f.trim())).filter(f => !isNaN(f));
    const newStaff: StaffMember = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
      role: newRole,
      availability: newAvailability,
      allocatedFloors: floorsArray
    };
    onAddStaff(newStaff);
    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewFloors('');
  };

  return (
    <div className="space-y-10 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Staff Directory</h2>
          <p className="text-slate-500 font-medium">Manage and contact your society's maintenance workforce.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden md:flex gap-2 p-1 bg-slate-100 rounded-2xl">
            {['ALL', 'CLEANING', 'PLUMBING', 'ELECTRICAL'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                {f}
              </button>
            ))}
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <span>➕</span> ADD STAFF
            </button>
          )}
        </div>
      </div>

      {user.role === UserRole.RESIDENT && floorNum > 0 && (
        <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
            ✨ Maintenance Team For Your Floor ({floorNum})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {staff.filter(s => s.role === StaffRole.CLEANING && s.allocatedFloors.includes(floorNum)).map(s => (
              <div key={s.id} className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 flex justify-between items-center group">
                <div>
                  <p className="font-black text-lg">{s.name}</p>
                  <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Assigned Cleaner • {s.availability}</p>
                </div>
                <a href={`tel:${s.phone}`} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl hover:scale-110 transition-transform">
                  📞
                </a>
              </div>
            ))}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStaff.map(s => (
          <div key={s.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {s.role === StaffRole.CLEANING ? '🧹' : s.role === StaffRole.ELECTRICAL ? '⚡' : s.role === StaffRole.PLUMBING ? '🔧' : '👤'}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{s.name}</h3>
                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest">{s.role}</span>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                <span className="font-bold text-slate-900">{s.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift</span>
                <span className="font-bold text-slate-600">{s.availability}</span>
              </div>
              {s.role === StaffRole.CLEANING && (
                <div className="pt-2 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Floors Covered</span>
                  <div className="flex flex-wrap gap-2">
                    {s.allocatedFloors.length > 0 ? s.allocatedFloors.map(f => (
                      <span key={f} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black">Floor {f}</span>
                    )) : <span className="text-[10px] font-bold text-slate-300">No floors assigned</span>}
                  </div>
                </div>
              )}
            </div>
            <a href={`tel:${s.phone}`} className="block w-full text-center bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-colors">
              CONTACT STAFF
            </a>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Add Maintenance Staff</h3>
                <button onClick={() => setShowAddModal(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">✕</button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
                    <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Raju Kumar" className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Phone Number</label>
                    <input required type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="e.g. +91 99999 88888" className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Professional Role</label>
                    <select value={newRole} onChange={e => setNewRole(e.target.value as StaffRole)} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all appearance-none">
                      <option value={StaffRole.CLEANING}>Cleaning Staff</option>
                      <option value={StaffRole.PLUMBING}>Plumbing</option>
                      <option value={StaffRole.ELECTRICAL}>Electrical</option>
                      <option value={StaffRole.SECURITY}>Security</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Working Shift</label>
                    <input required type="text" value={newAvailability} onChange={e => setNewAvailability(e.target.value)} placeholder="e.g. 08 AM - 04 PM" className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                  </div>
                </div>

                {newRole === StaffRole.CLEANING && (
                  <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100/50">
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Floor Allocations (Optional)</label>
                    <input type="text" value={newFloors} onChange={e => setNewFloors(e.target.value)} placeholder="e.g. 1, 2, 3 (Comma separated floor numbers)" className="w-full bg-white border-2 border-transparent focus:border-indigo-600 rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                    <p className="mt-3 text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Assign specific floors to this cleaner for resident transparency.</p>
                  </div>
                )}

                <div className="pt-6">
                  <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                    CONFIRM & REGISTER STAFF
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ config, maintenance, complaints, notices, user }: any) => {
  const chartData = [
    { n: 'Sep', a: 2500 }, { n: 'Oct', a: 3200 }, { n: 'Nov', a: 4100 }, { n: 'Dec', a: 3800 }
  ];

  const isAdmin = user.role !== UserRole.RESIDENT;

  // STRICT FILTERING FOR RESIDENTS
  const filteredMaintenance = isAdmin 
    ? maintenance 
    : maintenance.filter((m: MaintenanceRecord) => m.unit === user.unit);
  
  const filteredComplaints = isAdmin 
    ? complaints 
    : complaints.filter((c: Complaint) => c.unit === user.unit);

  const stats = [
    { label: isAdmin ? 'Unpaid Bills' : 'My Unpaid Bills', value: filteredMaintenance.filter((m: MaintenanceRecord) => m.status !== 'PAID').length, icon: '💸', color: 'bg-rose-50 text-rose-600' },
    { label: isAdmin ? 'Pending Complaints' : 'My Active Issues', value: filteredComplaints.filter((c: Complaint) => c.status !== 'RESOLVED').length, icon: '🛠️', color: 'bg-amber-50 text-amber-600' },
    { label: 'Active Notices', value: notices.length, icon: '📢', color: 'bg-indigo-50 text-indigo-600' },
    { label: isAdmin ? 'Total Units' : 'My Allotted Area', value: isAdmin ? '120' : `${user.areaOwned} SqFt`, icon: '🏢', color: 'bg-emerald-50 text-emerald-600' },
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
          <h3 className="text-2xl font-black mb-10 tracking-tight text-slate-900">{isAdmin ? 'Financial Insights' : 'My Payment History'}</h3>
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

// --- APP COMPONENT ---

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [config, setConfig] = useState<SocietyConfig>(DEFAULT_CONFIG);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [loginEmail, setLoginEmail] = useState('');

  const STORAGE_KEY = 'societysync_full_v3';

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      setMaintenance(p.maintenance || []);
      setComplaints(p.complaints || []);
      setNotices(p.notices || []);
      setStaff(p.staff || MOCK_STAFF);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ maintenance, complaints, notices, config, staff }));
  }, [maintenance, complaints, notices, config, staff]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (found) { setUser(found); }
    else { alert("Unauthorized access. Try demo emails: admin@society.com or john@example.com"); }
  };

  const handleLogout = () => { setUser(null); };

  const handleBackup = () => {
    const data = JSON.stringify({ maintenance, complaints, notices, config, staff }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SocietySync_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const p = JSON.parse(event.target?.result as string);
        if (p.config) setConfig(p.config);
        if (p.staff) setStaff(p.staff);
        if (p.maintenance) setMaintenance(p.maintenance);
        if (p.complaints) setComplaints(p.complaints);
        if (p.notices) setNotices(p.notices);
        alert("System Restored Successfully!");
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("ARE YOU SURE? This will permanently wipe all society data and reset to factory defaults.")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const renderContent = () => {
    if (!user) return null;
    switch (activeTab) {
      case 'dashboard': return <Dashboard config={config} maintenance={maintenance} complaints={complaints} notices={notices} user={user} />;
      case 'units': return <UnitsView users={MOCK_USERS} />;
      case 'staff': return <StaffView staff={staff} user={user} onAddStaff={(newMember) => setStaff(prev => [newMember, ...prev])} />;
      case 'maintenance': return (
        <div className="space-y-10 animate-in">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {user.role === UserRole.RESIDENT ? `Maintenance Ledger for ${user.unit}` : 'Society Financial Ledger'}
          </h2>
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
                {maintenance
                  .filter(m => user.role !== UserRole.RESIDENT || m.unit === user.unit)
                  .map(m => (
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
                      {m.status !== 'PAID' && user.role === UserRole.RESIDENT && (
                        <button onClick={() => setMaintenance(prev => prev.map(item => item.id === m.id ? {...item, status: 'PAID', paidDate: new Date().toLocaleDateString()} : item))} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all">PAY NOW</button>
                      )}
                      {m.status === 'PAID' && <span className="text-[10px] font-black text-emerald-500">PAID ✔</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
      case 'complaints': return (
        <div className="space-y-10 animate-in">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black text-slate-900">Complaint Register</h2>
            {user.role === UserRole.RESIDENT && (
              <button onClick={() => {
                const desc = prompt("Describe your complaint:");
                if (desc) {
                  setComplaints([{
                    id: Date.now().toString(),
                    description: desc,
                    status: 'OPEN',
                    residentName: user.name,
                    unit: user.unit,
                    createdAt: new Date().toLocaleDateString()
                  }, ...complaints]);
                }
              }} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/30">FILE COMPLAINT</button>
            )}
          </div>
          <div className="space-y-4">
            {complaints.filter(c => user.role !== UserRole.RESIDENT || c.unit === user.unit).map(c => (
              <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-lg mb-1">{c.description}</p>
                  <p className="text-sm text-slate-400 font-medium">Reported by {c.residentName} ({c.unit}) • {c.createdAt}</p>
                </div>
                {user.role !== UserRole.RESIDENT && c.status !== 'RESOLVED' && (
                  <button onClick={() => setComplaints(prev => prev.map(item => item.id === c.id ? {...item, status: 'RESOLVED'} : item))} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all">MARK RESOLVED</button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
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
      case 'setup': return <SetupView config={config} setConfig={setConfig} onBackup={handleBackup} onRestore={handleRestore} onReset={handleReset} />;
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