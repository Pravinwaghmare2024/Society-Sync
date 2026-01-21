
import React, { useState, useEffect } from 'react';
import { User, UserRole, MaintenanceRecord, Notice, Complaint } from './types.ts';
import { MOCK_USERS, MOCK_MAINTENANCE, MOCK_NOTICES, MOCK_COMPLAINTS } from './constants.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Maintenance from './components/Maintenance.tsx';
import Notices from './components/Notices.tsx';
import Complaints from './components/Complaints.tsx';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [loginEmail, setLoginEmail] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('society_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('society_user', JSON.stringify(foundUser));
    } else {
      alert("No user found with that email. Try 'admin@society.com' or 'john@example.com'");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('society_user');
  };

  const addNotice = (notice: Partial<Notice>) => {
    const newNotice: Notice = {
      id: Date.now().toString(),
      title: notice.title || 'No Title',
      content: notice.content || '',
      date: notice.date || new Date().toISOString().split('T')[0],
      priority: notice.priority || 'MEDIUM',
      author: notice.author || 'Admin'
    };
    setNotices([newNotice, ...notices]);
  };

  const addComplaint = (complaint: Partial<Complaint>) => {
    if (!user) return;
    const newComplaint: Complaint = {
      id: Date.now().toString(),
      title: complaint.title || '',
      description: complaint.description || '',
      category: complaint.category || 'Other',
      status: 'OPEN',
      residentId: user.id,
      residentName: user.name,
      unit: user.unit,
      createdAt: new Date().toISOString().split('T')[0],
      aiPriority: complaint.aiPriority,
      aiSummary: complaint.aiSummary
    };
    setComplaints([newComplaint, ...complaints]);
  };

  const updateComplaintStatus = (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handlePayMaintenance = (id: string) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: 'PAID', paidDate: new Date().toISOString().split('T')[0] } : m));
    alert("Payment Successful! Receipt generated.");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg">S</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SocietySync</h1>
            <p className="text-slate-500 mt-2">Login to your society portal</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input
                required
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="john@example.com (Resident) or admin@society.com (Admin)"
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-indigo-200 shadow-lg active:scale-95 transition-all"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm">Forgot password? Contact management.</p>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard role={user.role} maintenance={maintenance} complaints={complaints} notices={notices} />;
      case 'maintenance':
        return <Maintenance role={user.role} records={maintenance.filter(m => user.role === UserRole.ADMIN || m.unit === user.unit)} onPay={handlePayMaintenance} />;
      case 'notices':
        return <Notices role={user.role} notices={notices} addNotice={addNotice} />;
      case 'complaints':
        return <Complaints role={user.role} complaints={user.role === UserRole.ADMIN ? complaints : complaints.filter(c => c.residentId === user.id)} addComplaint={addComplaint} updateStatus={updateComplaintStatus} />;
      default:
        return <Dashboard role={user.role} maintenance={maintenance} complaints={complaints} notices={notices} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar
        role={user.role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto h-screen p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
