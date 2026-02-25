
import React, { useState, useEffect, useRef } from 'react';
import { SocietySettings, SystemConfig, User, UserRole, StaffMember, StaffRole } from '../types.ts';

interface SettingsProps {
  settings: SocietySettings;
  config: SystemConfig;
  users: User[];
  staff: StaffMember[];
  societies: SocietySettings[];
  onUpdateSettings: (s: SocietySettings) => void;
  onUpdateConfig: (c: SystemConfig) => void;
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  onAddStaff: (s: StaffMember) => void;
  onUpdateStaff: (s: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onResetDatabase: () => void;
  onAddSociety: (s: SocietySettings) => void;
  onUpdateSociety: (s: SocietySettings) => void;
  onDeleteSociety: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, config, users, staff, societies,
  onUpdateSettings, onUpdateConfig, 
  onAddUser, onUpdateUser, onDeleteUser,
  onAddStaff, onUpdateStaff, onDeleteStaff,
  onResetDatabase,
  onAddSociety, onUpdateSociety, onDeleteSociety
}) => {
  const [activeTab, setActiveTab] = useState<string>('society');
  const [localSettings, setLocalSettings] = useState<SocietySettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newCat, setNewCat] = useState('');
  const [newDocType, setNewDocType] = useState('');

  const [newUser, setNewUser] = useState({ 
    name: '', username: '', password: '', unit: '', role: UserRole.RESIDENT, email: '', residencyType: 'OWNER' as 'OWNER' | 'TENANT' 
  });

  useEffect(() => { setLocalSettings(settings); }, [settings]);

  const handleSaveSociety = () => {
    onUpdateSettings(localSettings);
    alert("Society profile sync successful.");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({ ...localSettings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    const updated = { ...localSettings, complaintCategories: [...localSettings.complaintCategories, newCat.trim()] };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    setNewCat('');
  };

  const handleRemoveCategory = (cat: string) => {
    const updated = { ...localSettings, complaintCategories: localSettings.complaintCategories.filter(c => c !== cat) };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleAddDocType = () => {
    if (!newDocType.trim()) return;
    const updated = { ...localSettings, requiredDocumentTypes: [...localSettings.requiredDocumentTypes, newDocType.trim().toUpperCase().replace(/\s+/g, '_')] };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    setNewDocType('');
  };

  const handleRemoveDocType = (type: string) => {
    const updated = { ...localSettings, requiredDocumentTypes: localSettings.requiredDocumentTypes.filter(t => t !== type) };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({ ...newUser, id: 'u_' + Date.now().toString(), societyId: settings.id, documents: [] } as User);
    setNewUser({ name: '', username: '', password: '', unit: '', role: UserRole.RESIDENT, email: '', residencyType: 'OWNER' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit flex-wrap gap-1 border border-slate-200 shadow-inner overflow-hidden">
        {[
          { id: 'society', label: 'Identity' },
          { id: 'helpdesk', label: 'Helpdesk & Docs' },
          { id: 'users', label: 'Residents' },
          { id: 'staff-config', label: 'Staff Hub' },
          { id: 'multi-society', label: 'Societies' },
          { id: 'database', label: 'System Data' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm min-h-[500px]">
        {activeTab === 'society' && (
          <div className="space-y-12 animate-in slide-in-from-left-4 duration-300">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">🏢</span>
                Society Branding
              </h3>
              
              <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
                <div className="relative group">
                  <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                    {localSettings.logoUrl ? (
                      <img src={localSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-slate-300">S</span>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
                  >
                    📸
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                  />
                </div>
                
                <div className="flex-1 space-y-6 w-full">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Society Name</label>
                    <input 
                      type="text" 
                      value={localSettings.name} 
                      onChange={e => setLocalSettings({...localSettings, name: e.target.value})} 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                    />
                    <p className="text-[9px] text-slate-400 ml-1">This name will appear on all receipts, notices, and the dashboard header.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Address</label>
                    <textarea 
                      value={localSettings.address} 
                      onChange={e => setLocalSettings({...localSettings, address: e.target.value})} 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 flex justify-end">
              <button 
                onClick={handleSaveSociety} 
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Sync Identity
              </button>
            </div>
          </div>
        )}

        {activeTab === 'helpdesk' && (
          <div className="space-y-12 animate-in slide-in-from-left-4 duration-300">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">🛠️</span>
                Helpdesk Categories
              </h3>
              <div className="flex gap-3 mb-6">
                <input 
                  type="text" 
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  placeholder="e.g. Swimming Pool"
                  className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 font-bold text-sm outline-none"
                />
                <button onClick={handleAddCategory} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Add Category</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {localSettings.complaintCategories.map(cat => (
                  <div key={cat} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-bold text-slate-700">
                    <span>{cat}</span>
                    <button onClick={() => handleRemoveCategory(cat)} className="text-rose-500 hover:text-rose-700 ml-2">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">📁</span>
                Mandatory Document Types
              </h3>
              <div className="flex gap-3 mb-6">
                <input 
                  type="text" 
                  value={newDocType}
                  onChange={e => setNewDocType(e.target.value)}
                  placeholder="e.g. ELECTRIC_BILL"
                  className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 font-bold text-sm outline-none uppercase"
                />
                <button onClick={handleAddDocType} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Add Requirement</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {localSettings.requiredDocumentTypes.map(type => (
                  <div key={type} className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 font-bold text-blue-700">
                    <span className="text-[10px] tracking-widest">{type}</span>
                    <button onClick={() => handleRemoveDocType(type)} className="text-blue-900/50 hover:text-blue-900 ml-2">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-in slide-in-from-left-4">
             <div className="bg-slate-50 p-8 rounded-[2.5rem]">
               <h4 className="font-black mb-6 uppercase text-xs">Provision New Resident</h4>
               <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <input required type="text" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="bg-white p-4 rounded-2xl font-bold text-sm outline-none" />
                 <input required type="text" placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="bg-white p-4 rounded-2xl font-bold text-sm outline-none" />
                 <input required type="text" placeholder="Unit" value={newUser.unit} onChange={e => setNewUser({...newUser, unit: e.target.value})} className="bg-white p-4 rounded-2xl font-bold text-sm outline-none" />
                 <button className="md:col-span-3 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Create ID</button>
               </form>
             </div>
             <table className="w-full text-left">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr><th className="pb-4">Holder</th><th className="pb-4">Unit</th><th className="pb-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.filter(u => u.societyId === settings.id).map(u => (
                    <tr key={u.id} className="text-sm font-bold text-slate-900 group">
                      <td className="py-5">{u.name}</td>
                      <td className="py-5">{u.unit}</td>
                      <td className="py-5">
                        <button onClick={() => onDeleteUser(u.id)} className="text-rose-500 text-[10px] uppercase font-black">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'database' && (
           <div className="text-center py-20">
              <div className="text-4xl mb-4">🏠</div>
              <h4 className="font-black text-slate-900 mb-2">Local Instance Core</h4>
              <p className="text-sm text-slate-500 mb-8">All society-specific configuration and helpdesk categories are saved to the current tenant profile.</p>
              <button onClick={onResetDatabase} className="bg-rose-50 text-rose-600 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Factory Reset System</button>
           </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
