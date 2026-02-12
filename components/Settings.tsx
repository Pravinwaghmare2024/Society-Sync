import React, { useState } from 'react';
import { SocietySettings, SystemConfig, DatabaseMode, User, UserRole, StaffMember, StaffRole } from '../types.ts';

interface SettingsProps {
  settings: SocietySettings; // The CURRENT active society
  config: SystemConfig;
  users: User[];
  staff: StaffMember[];
  societies: SocietySettings[]; // All societies for the multi-tenant tab
  onUpdateSettings: (s: SocietySettings) => void;
  onUpdateConfig: (c: SystemConfig) => void;
  onAddUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  onAddStaff: (s: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onResetDatabase: () => void;
  onAddSociety: (s: SocietySettings) => void;
  onDeleteSociety: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, config, users, staff, societies,
  onUpdateSettings, onUpdateConfig, 
  onAddUser, onDeleteUser,
  onAddStaff, onDeleteStaff,
  onResetDatabase,
  onAddSociety, onDeleteSociety
}) => {
  const [activeTab, setActiveTab] = useState<'society' | 'users' | 'staff-config' | 'database' | 'infrastructure' | 'communication' | 'multi-society'>('society');
  const [localSettings, setLocalSettings] = useState(settings);
  const [localConfig, setLocalConfig] = useState(config);

  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', unit: '', role: UserRole.RESIDENT, email: '', residencyType: 'OWNER' });
  const [newStaff, setNewStaff] = useState({ name: '', phone: '', role: StaffRole.CLEANING, availability: '', floors: '' });
  const [newSociety, setNewSociety] = useState({ name: '', code: '', address: '', regNo: '' });

  const handleSaveSociety = () => {
    onUpdateSettings(localSettings);
    alert("Society profile updated successfully.");
  };

  const handleSaveConfig = () => {
    onUpdateConfig(localConfig);
    alert("System configuration applied.");
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      alert("Username already exists in system directory.");
      return;
    }
    // Note: App.tsx handles assigning the correct societyId
    onAddUser({ ...newUser, id: Date.now().toString() } as User);
    setNewUser({ name: '', username: '', password: '', unit: '', role: UserRole.RESIDENT, email: '', residencyType: 'OWNER' });
    alert("User account provisioned successfully.");
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const allocatedFloors = newStaff.floors.split(',').map(f => parseInt(f.trim())).filter(f => !isNaN(f));
    onAddStaff({
      id: Date.now().toString(),
      name: newStaff.name,
      phone: newStaff.phone,
      role: newStaff.role,
      allocatedFloors,
      availability: newStaff.availability
    } as StaffMember);
    setNewStaff({ name: '', phone: '', role: StaffRole.CLEANING, availability: '', floors: '' });
    alert("Staff member registered in roster.");
  };

  const handleCreateSociety = (e: React.FormEvent) => {
    e.preventDefault();
    if (societies.find(s => s.code === newSociety.code)) {
      alert("Society Code must be unique.");
      return;
    }
    onAddSociety({
      id: 'soc_' + Date.now().toString(),
      code: newSociety.code,
      name: newSociety.name,
      address: newSociety.address,
      registrationNo: newSociety.regNo,
      gstNumber: '',
      baseMaintenance: 2000,
      lateFeePercent: 5,
      billingDay: 1
    });
    setNewSociety({ name: '', code: '', address: '', regNo: '' });
    alert("New Society Environment Created.");
  };

  const downloadWebConfig = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <staticContent>
            <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="${localConfig.webServer.staticCacheMaxAge}.00:00:00" />
            <remove fileExtension=".ts" /><remove fileExtension=".tsx" />
            <mimeMap fileExtension=".ts" mimeType="application/javascript" />
            <mimeMap fileExtension=".tsx" mimeType="application/javascript" />
        </staticContent>
        <rewrite>
            <rules>
                <rule name="SocietySync SPA" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="${localConfig.webServer.basePath}index.html" />
                </rule>
            </rules>
        </rewrite>
        <urlCompression doStaticCompression="${localConfig.webServer.enableGzip}" />
    </system.webServer>
</configuration>`;
    
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'web.config';
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit flex-wrap gap-1 border border-slate-200 shadow-inner">
        {[
          { id: 'society', label: 'Society Profile' },
          { id: 'users', label: 'User Directory' },
          { id: 'staff-config', label: 'Staff Roster' },
          { id: 'multi-society', label: 'Multi-Society' },
          { id: 'database', label: 'Data Source' },
          { id: 'infrastructure', label: 'Web Config' },
          { id: 'communication', label: 'SMTP Services' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[500px]">
        {activeTab === 'society' && (
          <div className="space-y-8 animate-in">
            <h3 className="text-xl font-black text-slate-900 mb-6">Master Society Profile ({localSettings.code})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                <input type="text" value={localSettings.name} onChange={e => setLocalSettings({...localSettings, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reg No.</label>
                <input type="text" value={localSettings.registrationNo} onChange={e => setLocalSettings({...localSettings, registrationNo: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Address</label>
                <textarea value={localSettings.address} onChange={e => setLocalSettings({...localSettings, address: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none h-24 resize-none" />
              </div>
            </div>
            <div className="pt-6 border-t border-slate-50 flex justify-end">
              <button onClick={handleSaveSociety} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">Save Identity</button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-12 animate-in">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <h4 className="text-sm font-black text-slate-900 uppercase mb-6 tracking-tight">Provision System Identity</h4>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input required type="text" placeholder="e.g. Alice Smith" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input required type="text" placeholder="e.g. alice.smith" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input required type="password" placeholder="••••••••" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Number</label>
                  <input required type="text" placeholder="A-101" value={newUser.unit} onChange={e => setNewUser({...newUser, unit: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Residency Type</label>
                  <select value={newUser.residencyType} onChange={e => setNewUser({...newUser, residencyType: e.target.value as 'OWNER' | 'TENANT'})} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm h-[52px]">
                    <option value="OWNER">Flat Owner</option>
                    <option value="TENANT">Rented / Tenant</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm h-[52px]">
                    <option value={UserRole.RESIDENT}>Resident Portal</option>
                    <option value={UserRole.ADMIN}>System Administrator</option>
                  </select>
                </div>
                <div className="flex items-end md:col-span-3">
                  <button type="submit" className="w-full bg-indigo-600 text-white rounded-2xl h-[52px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Authorize Account</button>
                </div>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4 pl-4">Account Holder</th>
                    <th className="pb-4">Username</th>
                    <th className="pb-4">Unit</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Privileges</th>
                    <th className="pb-4 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="text-sm font-bold text-slate-900 group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 pl-4">{u.name}</td>
                      <td className="py-5 font-mono text-xs text-slate-500">{u.username}</td>
                      <td className="py-5">{u.unit}</td>
                      <td className="py-5"><span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">{u.residencyType || 'OWNER'}</span></td>
                      <td className="py-5">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${u.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-5 text-right pr-4">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">Reset PWD</button>
                          <button onClick={() => onDeleteUser(u.id)} className="text-rose-400 text-[10px] font-black uppercase tracking-widest hover:text-rose-600">Deauthorize</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'staff-config' && (
          <div className="space-y-12 animate-in">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <h4 className="text-sm font-black text-slate-900 uppercase mb-6 tracking-tight">Register Facility Staff</h4>
              <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <input required type="text" placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" />
                <input required type="text" placeholder="Phone Link" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} className="bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" />
                <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value as StaffRole})} className="bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm">
                  {Object.values(StaffRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input required type="text" placeholder="Floors (1, 2, 3)" value={newStaff.floors} onChange={e => setNewStaff({...newStaff, floors: e.target.value})} className="bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" />
                <input required type="text" placeholder="Shift (e.g. 0900-1800)" value={newStaff.availability} onChange={e => setNewStaff({...newStaff, availability: e.target.value})} className="bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" />
                <button type="submit" className="bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100">Save Record</button>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4 pl-4">Staff Name</th>
                    <th className="pb-4">Primary Role</th>
                    <th className="pb-4">Contact</th>
                    <th className="pb-4">Floor Coverage</th>
                    <th className="pb-4 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {staff.map(s => (
                    <tr key={s.id} className="text-sm font-bold text-slate-900 group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 pl-4">{s.name}</td>
                      <td className="py-5">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase tracking-tighter">{s.role}</span>
                      </td>
                      <td className="py-5 font-mono text-xs text-slate-500">{s.phone}</td>
                      <td className="py-5">
                        <div className="flex gap-1 flex-wrap max-w-[150px]">
                          {s.allocatedFloors.map(f => <span key={f} className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded text-[9px]">F{f}</span>)}
                        </div>
                      </td>
                      <td className="py-5 text-right pr-4">
                        <button onClick={() => onDeleteStaff(s.id)} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-widest">Wipe Record</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'multi-society' && (
           <div className="space-y-12 animate-in">
             <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
               <h4 className="text-sm font-black text-slate-900 uppercase mb-6 tracking-tight">Provision New Society Tenant</h4>
               <form onSubmit={handleCreateSociety} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Society Name</label>
                   <input required type="text" value={newSociety.name} onChange={e => setNewSociety({...newSociety, name: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" placeholder="e.g. Royal Heights" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Login Code (Unique)</label>
                   <input required type="text" value={newSociety.code} onChange={e => setNewSociety({...newSociety, code: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" placeholder="e.g. RH_001" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration No.</label>
                   <input required type="text" value={newSociety.regNo} onChange={e => setNewSociety({...newSociety, regNo: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                   <input required type="text" value={newSociety.address} onChange={e => setNewSociety({...newSociety, address: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm" />
                 </div>
                 <div className="md:col-span-2 pt-2">
                   <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">Create Environment</button>
                 </div>
               </form>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                     <th className="pb-4 pl-4">Society</th>
                     <th className="pb-4">Login Code</th>
                     <th className="pb-4">System ID</th>
                     <th className="pb-4 text-right pr-4">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {societies.map(s => (
                     <tr key={s.id} className={`text-sm font-bold text-slate-900 group ${settings.id === s.id ? 'bg-indigo-50/50' : ''}`}>
                       <td className="py-5 pl-4">{s.name}<br/><span className="text-[10px] font-normal text-slate-500">{s.address}</span></td>
                       <td className="py-5 font-mono text-xs text-indigo-600 bg-indigo-50 w-fit px-2 rounded">{s.code}</td>
                       <td className="py-5 font-mono text-xs text-slate-400">{s.id}</td>
                       <td className="py-5 text-right pr-4">
                         {settings.id !== s.id && <button onClick={() => onDeleteSociety(s.id)} className="text-rose-400 text-[10px] font-black uppercase tracking-widest hover:text-rose-600">Delete</button>}
                         {settings.id === s.id && <span className="text-[9px] font-black text-green-600 uppercase">Current</span>}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-12 animate-in">
            <h3 className="text-xl font-black text-slate-900 mb-6">Database Connection Strategy</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { id: 'LOCAL_STORAGE', label: 'Local Browser Storage', desc: 'No Server Required', icon: '🏠' },
                { id: 'PRODUCTION_REST_API', label: 'REST API', desc: 'Enterprise Gateway', icon: '🌍' },
                { id: 'POSTGRESQL', label: 'PostgreSQL', desc: 'Direct SQL Connect', icon: '🐘' },
                { id: 'MYSQL', label: 'MySQL / MariaDB', desc: 'Standard Relational', icon: '🐬' },
                { id: 'FIREBASE_REALTIME', label: 'Firebase', desc: 'Realtime Sync', icon: '🔥' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setLocalConfig({...localConfig, dbMode: m.id as DatabaseMode})}
                  className={`p-6 rounded-3xl text-left border-2 transition-all ${
                    localConfig.dbMode === m.id 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-200' 
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <div className="font-bold text-slate-900 text-sm">{m.label}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{m.desc}</div>
                </button>
              ))}
            </div>

            {localConfig.dbMode === 'LOCAL_STORAGE' && (
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                 <div className="text-2xl">ℹ️</div>
                 <div>
                   <h4 className="font-bold text-indigo-900 mb-1">Browser-based Persistence</h4>
                   <p className="text-sm text-indigo-700 leading-relaxed">System is running in offline-first mode. All data is encrypted and stored within this specific browser instance's LocalStorage. Data will persist across refreshes but will not sync across different devices.</p>
                 </div>
              </div>
            )}

            {(localConfig.dbMode === 'PRODUCTION_REST_API' || localConfig.dbMode === 'FIREBASE_REALTIME') && (
              <div className="grid grid-cols-1 gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {localConfig.dbMode === 'FIREBASE_REALTIME' ? 'Firebase Database URL' : 'API Endpoint URL'}
                  </label>
                  <input 
                    type="text" 
                    value={localConfig.apiEndpoint} 
                    onChange={e => setLocalConfig({...localConfig, apiEndpoint: e.target.value})} 
                    placeholder="https://..." 
                    className="w-full bg-white border-none rounded-2xl px-5 py-4 font-mono text-sm text-indigo-600 outline-none shadow-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {localConfig.dbMode === 'FIREBASE_REALTIME' ? 'Service Account Key (JSON)' : 'Bearer Token / API Key'}
                  </label>
                  <textarea 
                    value={localConfig.authToken} 
                    onChange={e => setLocalConfig({...localConfig, authToken: e.target.value})} 
                    className="w-full bg-white border-none rounded-2xl px-5 py-4 font-mono text-xs text-slate-600 outline-none shadow-sm h-32" 
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>
              </div>
            )}

            {(localConfig.dbMode === 'POSTGRESQL' || localConfig.dbMode === 'MYSQL') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hostname / IP</label>
                  <input type="text" value={localConfig.dbHost || ''} onChange={e => setLocalConfig({...localConfig, dbHost: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 font-mono text-sm outline-none shadow-sm" placeholder="127.0.0.1" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Port</label>
                  <input type="number" value={localConfig.dbPort || ''} onChange={e => setLocalConfig({...localConfig, dbPort: parseInt(e.target.value)})} className="w-full bg-white border-none rounded-2xl px-5 py-4 font-mono text-sm outline-none shadow-sm" placeholder="5432" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Database Name</label>
                  <input type="text" value={localConfig.dbName || ''} onChange={e => setLocalConfig({...localConfig, dbName: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 font-mono text-sm outline-none shadow-sm" placeholder="societysync" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input type="text" value={localConfig.dbUser || ''} onChange={e => setLocalConfig({...localConfig, dbUser: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 font-mono text-sm outline-none shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input type="password" value={localConfig.dbPassword || ''} onChange={e => setLocalConfig({...localConfig, dbPassword: e.target.value})} className="w-full bg-white border-none rounded-2xl px-5 py-4 font-mono text-sm outline-none shadow-sm" />
                </div>
                <div className="md:col-span-2 flex items-center gap-4 mt-2">
                  <input type="checkbox" checked={localConfig.dbSsl} onChange={e => setLocalConfig({...localConfig, dbSsl: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
                  <span className="text-xs font-bold text-slate-600">Enable SSL/TLS Encryption</span>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-50 flex justify-end gap-4">
              <button className="bg-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 transition-colors">Test Connection</button>
              <button onClick={handleSaveConfig} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-colors">Apply & Restart</button>
            </div>
          </div>
        )}

        {activeTab === 'infrastructure' && (
          <div className="space-y-12 animate-in">
            <h3 className="text-xl font-black text-slate-900 mb-6">IIS Deployment Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application Base Path</label>
                  <input type="text" value={localConfig.webServer.basePath} onChange={e => setLocalConfig({...localConfig, webServer: {...localConfig.webServer, basePath: e.target.value}})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-mono text-sm text-slate-600 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Static Cache TTL (Days)</label>
                  <input type="number" value={localConfig.webServer.staticCacheMaxAge} onChange={e => setLocalConfig({...localConfig, webServer: {...localConfig.webServer, staticCacheMaxAge: parseInt(e.target.value)}})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none" />
                </div>
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enable Dynamic Gzip</span>
                  <input type="checkbox" checked={localConfig.webServer.enableGzip} onChange={e => setLocalConfig({...localConfig, webServer: {...localConfig.webServer, enableGzip: e.target.checked}})} className="w-6 h-6 rounded-lg text-indigo-600" />
                </div>
              </div>
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10 flex flex-col h-full">
                  <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4">Web.Config Automation</h4>
                  <p className="text-xs text-slate-400 mb-8 leading-relaxed">Generated XML configuration optimized for Windows IIS hosting with proper MIME mappings and URL rewrites.</p>
                  <button onClick={downloadWebConfig} className="mt-auto bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/40 group-hover:bg-indigo-500 transition-colors">Download Configuration</button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="space-y-12 animate-in">
             <h3 className="text-xl font-black text-slate-900 mb-6">Service Communication (SMTP)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Relay Host</label>
                 <input type="text" value={localConfig.smtp.host} onChange={e => setLocalConfig({...localConfig, smtp: {...localConfig.smtp, host: e.target.value}})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-mono text-sm text-slate-600 outline-none" placeholder="smtp.office365.com" />
               </div>
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sender Name</label>
                 <input type="text" value={localConfig.smtp.senderName} onChange={e => setLocalConfig({...localConfig, smtp: {...localConfig.smtp, senderName: e.target.value}})} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none" />
               </div>
             </div>
             <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Status: Connected</span>
               </div>
               <button onClick={handleSaveConfig} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">Save Communication Link</button>
             </div>
          </div>
        )}
      </div>

      <div className="bg-rose-50 p-10 rounded-[3rem] border border-rose-100 mt-12 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-rose-900 uppercase tracking-tight mb-1">Critical Management Tools</h4>
          <p className="text-xs text-rose-600 font-medium">Clear all server-side local storage and reset environment.</p>
        </div>
        <button onClick={() => { if(confirm("This will permanently purge the IIS Local Database. Proceed?")) onResetDatabase() }} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200">Wipe Database</button>
      </div>
    </div>
  );
};

export default Settings;