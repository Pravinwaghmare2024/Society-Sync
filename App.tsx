
import React, { useState } from 'react';
import { 
  UserRole, MaintenanceRecord, Notice, Complaint, StaffMember, SocietySettings, SystemConfig, UserDocument, User, ServerInstance, Voucher, SalaryPayment, AccountBalance
} from './types.ts';
import { 
  MOCK_USERS, MOCK_MAINTENANCE, MOCK_NOTICES, MOCK_COMPLAINTS, MOCK_STAFF, MOCK_SERVERS, MOCK_VOUCHERS, MOCK_SALARIES, MOCK_BALANCES 
} from './constants.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Maintenance from './components/Maintenance.tsx';
import Documents from './components/Documents.tsx';
import Complaints from './components/Complaints.tsx';
import Notices from './components/Notices.tsx';
import Staff from './components/Staff.tsx';
import Settings from './components/Settings.tsx';
import SocietyConfiguration from './components/SocietyConfiguration.tsx';
import Accounting from './components/Accounting.tsx';
import InstallationGuide from './components/InstallationGuide.tsx';
import LoginPage from './components/LoginPage.tsx';

const INITIAL_SOCIETY: SocietySettings = {
  id: 'soc_1',
  code: 'GVR_001',
  name: 'Grand View Residency',
  address: '123 Sky Lane, Sector 45, Metropolis',
  phone: '+91 98765 43210',
  email: 'admin@grandview.com',
  registrationNo: 'MS/2023/1234',
  gstNumber: '27AAAAA0000A1Z5',
  baseMaintenance: 2500,
  lateFeePercent: 10,
  billingDay: 5,
  complaintCategories: ['Plumbing', 'Electrical', 'Security', 'Cleaning', 'Lifts', 'Parking'],
  requiredDocumentTypes: ['AADHAR', 'POLICE_VERIFICATION']
};

const INITIAL_CONFIG: SystemConfig = {
  dbMode: 'LOCAL_STORAGE',
  apiEndpoint: '',
  authToken: '',
  isMaintenanceMode: false,
  version: '3.0.1',
  webServer: { basePath: '/', staticCacheMaxAge: 30, enableGzip: true, enableCsp: true, hstsMaxAge: 31536000 },
  smtp: { host: 'smtp.gmail.com', port: 587, user: 'admin@society.com', secure: true, senderName: 'SocietySync Admin' }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeServer, setActiveServer] = useState<ServerInstance | null>(null);
  
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS as User[]);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS as Complaint[]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE as MaintenanceRecord[]);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES as Notice[]);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF as StaffMember[]);
  const [vouchers, setVouchers] = useState<Voucher[]>(MOCK_VOUCHERS as Voucher[]);
  const [salaries, setSalaries] = useState<SalaryPayment[]>(MOCK_SALARIES as SalaryPayment[]);
  const [balances, setBalances] = useState<AccountBalance>(MOCK_BALANCES as AccountBalance);
  
  const [societies, setSocieties] = useState<SocietySettings[]>([INITIAL_SOCIETY]);
  const [activeSociety, setActiveSociety] = useState<SocietySettings>(INITIAL_SOCIETY);
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);

  const handleLogout = () => {
    setUser(null);
    setActiveServer(null);
    setActiveTab('dashboard');
  };

  const handleLoginSuccess = (authenticatedUser: User, societyContext: SocietySettings, serverContext: ServerInstance) => {
    setActiveSociety(societyContext);
    setActiveServer(serverContext);
    setUser(authenticatedUser);
    setConfig(prev => ({...prev, apiEndpoint: serverContext.endpoint}));
  };

  const handleUpdateDocs = (uid: string, docs: UserDocument[]) => {
    setAllUsers(prev => prev.map(u => u.id === uid ? { ...u, documents: docs } : u));
    if (user && user.id === uid) {
      setUser(prev => prev ? { ...prev, documents: docs } : null);
    }
  };

  const handleUpdateSocietySettings = (updated: SocietySettings) => {
    setSocieties(prev => prev.map(s => s.id === updated.id ? updated : s));
    if (activeSociety.id === updated.id) {
      setActiveSociety(updated);
    }
  };

  if (!user) {
    return (
      <LoginPage 
        societies={societies} 
        allUsers={allUsers} 
        servers={MOCK_SERVERS}
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar 
        role={user.role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        society={activeSociety}
      />
      
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${activeServer?.status === 'ONLINE' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {activeSociety.name} • {activeServer?.name} • Unit {user.unit}
              </p>
            </div>
            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{activeTab.replace('-', ' ')}</h2>
          </div>
          
          <div className="flex items-center gap-5 text-right bg-white p-3 pr-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-100 overflow-hidden">
              {activeSociety.logoUrl ? (
                <img src={activeSociety.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                user.name ? user.name[0] : 'U'
              )}
            </div>
            <div>
              <p className="font-black text-slate-900 leading-none">{user.name}</p>
              <div className="flex items-center justify-end gap-3 mt-1.5">
                 <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{user.residencyType || 'OWNER'}</p>
                 <button 
                  onClick={handleLogout} 
                  className="text-[10px] text-rose-500 font-black uppercase tracking-widest hover:text-rose-600 flex items-center gap-1 transition-colors"
                >
                  Terminate
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl pb-20">
          {activeTab === 'dashboard' && (
            <Dashboard 
              role={user.role}
              societyName={activeSociety.name} 
              maintenance={maintenance.filter(m => m.societyId === activeSociety.id)} 
              complaints={complaints.filter(c => c.societyId === activeSociety.id)} 
              notices={notices.filter(n => n.societyId === activeSociety.id)} 
            />
          )}
          
          {activeTab === 'maintenance' && (
            <Maintenance 
              role={user.role} 
              records={maintenance.filter(m => m.societyId === activeSociety.id)} 
              onPay={(id, tx, file) => setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: 'AWAITING_APPROVAL', transactionId: tx, proofFileName: file, paidDate: new Date().toISOString().split('T')[0] } as MaintenanceRecord : m))} 
              onVerify={(id, s) => setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: s } as MaintenanceRecord : m))} 
            />
          )}
          
          {activeTab === 'documents' && (
            <Documents 
              user={user} 
              allUsers={allUsers.filter(u => u.societyId === activeSociety.id)} 
              onUpdateDocuments={handleUpdateDocs}
              requiredTypes={activeSociety.requiredDocumentTypes}
            />
          )}

          {activeTab === 'notices' && (
            <Notices 
              role={user.role} 
              notices={notices.filter(n => n.societyId === activeSociety.id)} 
              addNotice={(n) => setNotices(prev => [{ ...n, id: Date.now().toString(), societyId: activeSociety.id } as Notice, ...prev])} 
            />
          )}
          
          {activeTab === 'complaints' && (
            <Complaints 
              role={user.role} 
              complaints={complaints.filter(c => c.societyId === activeSociety.id)} 
              categories={activeSociety.complaintCategories}
              addComplaint={(c) => setComplaints(prev => [{ ...c, id: Date.now().toString(), residentId: user.id, residentName: user.name, unit: user.unit, status: 'OPEN', createdAt: new Date().toISOString().split('T')[0], societyId: activeSociety.id } as Complaint, ...prev])} 
              updateStatus={(id, s) => setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: s } as Complaint : c))} 
            />
          )}

          {activeTab === 'staff' && (
            <Staff 
              role={user.role} 
              staff={staff.filter(s => s.societyId === activeSociety.id)} 
              userUnit={user.unit} 
              addStaff={(s) => setStaff(prev => [...prev, { ...s, id: Date.now().toString(), societyId: activeSociety.id } as StaffMember])}
              deleteStaff={(id) => setStaff(prev => prev.filter(s => s.id !== id))}
            />
          )}

          {activeTab === 'accounting' && (
            <Accounting 
              vouchers={vouchers.filter(v => v.societyId === activeSociety.id)}
              salaries={salaries.filter(s => s.societyId === activeSociety.id)}
              balances={balances}
              staff={staff.filter(s => s.societyId === activeSociety.id)}
              onAddVoucher={(v) => {
                const id = 'v' + Date.now();
                setVouchers(prev => [{ ...v, id, societyId: activeSociety.id } as Voucher, ...prev]);
                setBalances(prev => {
                  const amount = v.type === 'RECEIPT' ? v.amount : -v.amount;
                  if (v.account === 'BANK') return { ...prev, bank: prev.bank + amount };
                  if (v.account === 'CASH') return { ...prev, cash: prev.cash + amount };
                  return { ...prev, pettyCash: prev.pettyCash + amount };
                });
              }}
              onAddSalary={(s) => {
                const id = 'sal' + Date.now();
                setSalaries(prev => [{ ...s, id, societyId: activeSociety.id } as SalaryPayment, ...prev]);
                setBalances(prev => {
                  if (s.paymentMethod === 'BANK') return { ...prev, bank: prev.bank - s.amount };
                  return { ...prev, cash: prev.cash - s.amount };
                });
              }}
            />
          )}

          {activeTab === 'society-config' && user.role === UserRole.ADMIN && (
            <SocietyConfiguration 
              settings={activeSociety} 
              onUpdateSettings={handleUpdateSocietySettings} 
            />
          )}

          {activeTab === 'settings' && user.role === UserRole.ADMIN && (
            <Settings 
              settings={activeSociety}
              config={config}
              users={allUsers}
              staff={staff}
              societies={societies}
              onUpdateSettings={handleUpdateSocietySettings}
              onUpdateConfig={setConfig}
              onAddUser={(u) => setAllUsers(prev => [...prev, u])}
              onUpdateUser={(u) => setAllUsers(prev => prev.map(old => old.id === u.id ? u : old))}
              onDeleteUser={(id) => setAllUsers(prev => prev.filter(u => u.id !== id))}
              onAddStaff={(s) => setStaff(prev => [...prev, s])}
              onUpdateStaff={(s) => setStaff(prev => prev.map(old => old.id === s.id ? s : old))}
              onDeleteStaff={(id) => setStaff(prev => prev.filter(s => s.id !== id))}
              onResetDatabase={() => { 
                setAllUsers(MOCK_USERS as User[]); 
                setComplaints(MOCK_COMPLAINTS as Complaint[]); 
                setMaintenance(MOCK_MAINTENANCE as MaintenanceRecord[]); 
                setNotices(MOCK_NOTICES as Notice[]); 
                setStaff(MOCK_STAFF as StaffMember[]); 
                setActiveSociety(INITIAL_SOCIETY);
                alert("Database state re-initialized to factory defaults.");
              }}
              onAddSociety={(s) => setSocieties(prev => [...prev, s])}
              onUpdateSociety={(s) => setSocieties(prev => prev.map(old => old.id === s.id ? s : old))}
              onDeleteSociety={(id) => {
                if (societies.length <= 1) return alert("Security Restriction: At least one society tenant must remain active.");
                setSocieties(prev => prev.filter(s => s.id !== id));
              }}
            />
          )}

          {activeTab === 'installation' && user.role === UserRole.ADMIN && (
            <InstallationGuide />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
