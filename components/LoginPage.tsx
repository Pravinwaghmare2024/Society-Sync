
import React, { useState, useEffect } from 'react';
import { User, SocietySettings, UserRole, ServerInstance } from '../types.ts';

interface LoginPageProps {
  societies: SocietySettings[];
  allUsers: User[];
  servers: ServerInstance[];
  onLoginSuccess: (user: User, society: SocietySettings, server: ServerInstance) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ societies, allUsers, servers, onLoginSuccess }) => {
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>(UserRole.RESIDENT);
  const [selectedServerId, setSelectedServerId] = useState<string>(servers.find(s => s.isDefault)?.id || servers[0].id);
  const [societyCode, setSocietyCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSociety, setCurrentSociety] = useState<SocietySettings | null>(null);

  const selectedServer = servers.find(s => s.id === selectedServerId)!;

  useEffect(() => {
    const code = societyCode.trim().toUpperCase();
    const society = societies.find(s => s.code.toUpperCase() === code);
    setCurrentSociety(society || null);
  }, [societyCode, societies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServer.status === 'OFFLINE' || selectedServer.status === 'MAINTENANCE') {
      setError(`Infrastructure "${selectedServer.name}" is currently unavailable.`);
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const code = societyCode.trim().toUpperCase();
      const society = societies.find(s => s.code.toUpperCase() === code);

      if (!society) {
        setError(`Enterprise ID "${code}" not found on ${selectedServer.name}.`);
        setLoading(false);
        return;
      }

      const foundUser = allUsers.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password && 
        u.societyId === society.id
      );

      if (!foundUser) {
        setError("Invalid credentials for this society instance.");
        setLoading(false);
        return;
      }

      onLoginSuccess(foundUser, society, selectedServer);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-500';
      case 'DEGRADED': return 'bg-amber-500';
      case 'OFFLINE': return 'bg-rose-500';
      case 'MAINTENANCE': return 'bg-indigo-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-100 transform animate-in fade-in zoom-in duration-700">
          
          <div className="p-12 pb-6 text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center font-black text-4xl text-white mx-auto mb-8 shadow-2xl shadow-indigo-200 overflow-hidden">
              {currentSociety?.logoUrl ? (
                <img src={currentSociety.logoUrl} alt="Society Logo" className="w-full h-full object-cover" />
              ) : (
                'S'
              )}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {currentSociety?.name || 'SocietySync'}
            </h1>
            {currentSociety && (
              <div className="flex flex-col items-center gap-1 mb-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {currentSociety.phone} • {currentSociety.email}
                </p>
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">Authentication Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="px-12 pb-14 space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl text-[11px] font-bold border border-rose-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                <span className="text-base">⚠️</span> {error}
              </div>
            )}

            {/* Server Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Infrastructure</label>
              <div className="relative group">
                <select 
                  value={selectedServerId}
                  onChange={e => setSelectedServerId(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none transition-all cursor-pointer"
                >
                  {servers.map(srv => (
                    <option key={srv.id} value={srv.id}>{srv.name}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(selectedServer.status)}`}></span>
                  <span className="text-indigo-600">▾</span>
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-400 ml-1">
                Endpoint: <span className="text-indigo-500 font-mono">{selectedServer.endpoint}</span> • Region: {selectedServer.region}
              </p>
            </div>

            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 mt-2">
              <button 
                type="button"
                onClick={() => setActiveRoleTab(UserRole.RESIDENT)}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeRoleTab === UserRole.RESIDENT ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                Resident
              </button>
              <button 
                type="button"
                onClick={() => setActiveRoleTab(UserRole.ADMIN)}
                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeRoleTab === UserRole.ADMIN ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                Management
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enterprise Code</label>
              <input 
                required
                type="text" 
                placeholder="GVR_001"
                value={societyCode}
                onChange={e => setSocietyCode(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4.5 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / ID</label>
                <input 
                  required
                  type="text" 
                  placeholder="Resident ID"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret</label>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Syncing...</span>
                </>
              ) : `Connect to ${selectedServer.region}`}
            </button>
          </form>

          <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Demo Instance v3.1 • Infrastructure: <span className="text-green-500">Tier-IV</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
