
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
              <div className="w-24 h-24 bg-slate-100 rounded-[2rem] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                {localSettings.logoUrl ? (
                  <img src={localSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-slate-300">S</span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
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
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Society Profile</h3>
              <p className="text-sm text-slate-500 font-medium">Manage your society's public identity and contact details.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                isSaving ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {isSaving ? 'Syncing...' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Society Name</label>
              <input
                type="text"
                name="name"
                value={localSettings.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Enter society name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Society Code</label>
              <input
                type="text"
                name="code"
                value={localSettings.code}
                onChange={handleChange}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="e.g. GVR_001"
              />
            </div>

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

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Address</label>
              <textarea
                name="address"
                value={localSettings.address}
                onChange={handleChange}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-[124px] resize-none"
                placeholder="Full registered address"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={localSettings.phone || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="admin@society.com"
                />
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
