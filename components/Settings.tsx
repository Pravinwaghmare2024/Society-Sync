
import React, { useState } from 'react';
import { SocietySettings, SystemConfig, DatabaseMode } from '../types';

interface SettingsProps {
  settings: SocietySettings;
  config: SystemConfig;
  onUpdateSettings: (s: SocietySettings) => void;
  onUpdateConfig: (c: SystemConfig) => void;
  onResetDatabase: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, config, onUpdateSettings, onUpdateConfig, onResetDatabase }) => {
  const [activeTab, setActiveTab] = useState<'society' | 'production'>('society');
  const [localSettings, setLocalSettings] = useState(settings);
  const [localConfig, setLocalConfig] = useState(config);

  const handleSaveSociety = () => {
    onUpdateSettings(localSettings);
    alert("Society profile updated successfully.");
  };

  const handleSaveConfig = () => {
    onUpdateConfig(localConfig);
    alert("Production configuration applied. Reconnecting to services...");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Administration</h2>
        <p className="text-slate-500 font-medium">Configure society profile and production environment settings.</p>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('society')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'society' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Society Profile
        </button>
        <button 
          onClick={() => setActiveTab('production')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'production' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Production & DB
        </button>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        {activeTab === 'society' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Entity Name</label>
                <input 
                  type="text" 
                  value={localSettings.name}
                  onChange={e => setLocalSettings({...localSettings, name: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration No.</label>
                <input 
                  type="text" 
                  value={localSettings.registrationNo}
                  onChange={e => setLocalSettings({...localSettings, registrationNo: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Address</label>
                <textarea 
                  value={localSettings.address}
                  onChange={e => setLocalSettings({...localSettings, address: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none h-24 resize-none"
                />
              </div>
            </div>
            <div className="pt-6 border-t border-slate-50 flex justify-end">
              <button onClick={handleSaveSociety} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">Save Profile</button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase">Database Architecture</h4>
                <select 
                  value={localConfig.dbMode}
                  onChange={e => setLocalConfig({...localConfig, dbMode: e.target.value as DatabaseMode})}
                  className="w-full bg-slate-900 text-white border-none rounded-2xl px-5 py-4 font-bold outline-none"
                >
                  <option value="LOCAL_STORAGE">Local Browser DB (Dev)</option>
                  <option value="PRODUCTION_REST_API">Production REST API</option>
                  <option value="FIREBASE_REALTIME">Cloud Realtime DB</option>
                </select>
                <p className="text-xs text-slate-400 italic">Select the environment for data persistence. Local storage is best for testing.</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase">Production Endpoint</h4>
                <input 
                  type="text" 
                  placeholder="https://api.societysync.com/v1"
                  value={localConfig.apiEndpoint}
                  onChange={e => setLocalConfig({...localConfig, apiEndpoint: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-mono text-xs text-slate-600 outline-none"
                />
              </div>
            </div>

            <div className="p-8 bg-rose-50 rounded-[2rem] border border-rose-100">
              <h4 className="text-sm font-black text-rose-900 uppercase mb-2">Danger Zone</h4>
              <p className="text-xs text-rose-600 mb-6">Resetting the database will clear all resident data, maintenance logs, and configuration permanently.</p>
              <button onClick={() => { if(confirm("Are you absolutely sure?")) onResetDatabase() }} className="bg-rose-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest">Wipe Local Database</button>
            </div>

            <div className="pt-6 border-t border-slate-50 flex justify-end">
              <button onClick={handleSaveConfig} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Apply Environment Changes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
