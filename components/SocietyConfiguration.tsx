
import React, { useState, useEffect, useRef } from 'react';
import { SocietySettings } from '../types.ts';

interface SocietyConfigurationProps {
  settings: SocietySettings;
  onUpdateSettings: (s: SocietySettings) => void;
}

const SocietyConfiguration: React.FC<SocietyConfigurationProps> = ({ settings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState<SocietySettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      onUpdateSettings(localSettings);
      setIsSaving(false);
      alert("Society configuration updated successfully!");
    }, 800);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-28 h-28 bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                {localSettings.logoUrl ? (
                  <img src={localSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-slate-300">S</span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all hover:rotate-12"
                title="Update Society Logo"
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
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Branding & Identity</h3>
              <p className="text-sm text-slate-500 font-medium">Define your society's visual presence and official name.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                isSaving ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {isSaving ? 'Syncing...' : '💾 Save Branding'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs">🏷️</span>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Core Identity</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Society Display Name</label>
                  <input
                    type="text"
                    name="name"
                    value={localSettings.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. Grand View Residency"
                  />
                  <p className="text-[9px] text-slate-400 ml-1 italic">This name appears on the dashboard and all official documents.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Society Code</label>
                  <input
                    type="text"
                    name="code"
                    value={localSettings.code}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. GVR_001"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs">📍</span>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Legal & Contact</h4>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Address</label>
                  <textarea
                    name="address"
                    value={localSettings.address}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none"
                    placeholder="Full registered address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration Number</label>
                    <input
                      type="text"
                      name="registrationNo"
                      value={localSettings.registrationNo}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Reg. No."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Number</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={localSettings.gstNumber}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="GSTIN"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Contact Channels</h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={localSettings.phone || ''}
                    onChange={handleChange}
                    className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="+91 00000 00000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                  <input
                    type="email"
                    name="email"
                    value={localSettings.email || ''}
                    onChange={handleChange}
                    className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                    placeholder="admin@society.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100">
              <div className="w-12 h-12 bg-indigo-800 rounded-2xl flex items-center justify-center text-2xl mb-6">✨</div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-3">Live Preview</h4>
              <p className="text-xs text-indigo-200 font-medium leading-relaxed mb-6">
                Your logo and name are automatically synced to the sidebar and all resident portals.
              </p>
              <div className="flex items-center gap-4 bg-indigo-800/50 p-4 rounded-2xl border border-indigo-700/50">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  {localSettings.logoUrl ? (
                    <img src={localSettings.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-indigo-600 font-black">S</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest truncate">{localSettings.name || 'Society Name'}</p>
                  <p className="text-[8px] text-indigo-300 font-bold uppercase tracking-widest">Active Branding</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Important Notice</p>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Updating the society name or registration details will affect all future maintenance bills and official notices generated by the system. Ensure the information matches your legal registration documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocietyConfiguration;
