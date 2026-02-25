
import React, { useState } from 'react';
import { Voucher, SalaryPayment, AccountBalance, VoucherType, AccountType, StaffMember } from '../types.ts';

interface AccountingProps {
  vouchers: Voucher[];
  salaries: SalaryPayment[];
  balances: AccountBalance;
  staff: StaffMember[];
  onAddVoucher: (v: Omit<Voucher, 'id' | 'societyId'>) => void;
  onAddSalary: (s: Omit<SalaryPayment, 'id' | 'societyId'>) => void;
}

const Accounting: React.FC<AccountingProps> = ({ vouchers, salaries, balances, staff, onAddVoucher, onAddSalary }) => {
  const [activeTab, setActiveTab] = useState<'vouchers' | 'salaries' | 'balances'>('balances');
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  const [newVoucher, setNewVoucher] = useState<Omit<Voucher, 'id' | 'societyId'>>({
    date: new Date().toISOString().split('T')[0],
    type: 'PAYMENT',
    account: 'CASH',
    amount: 0,
    description: '',
    category: 'General'
  });

  const [newSalary, setNewSalary] = useState<Omit<SalaryPayment, 'id' | 'societyId'>>({
    staffId: '',
    staffName: '',
    amount: 0,
    month: 'November',
    date: new Date().toISOString().split('T')[0],
    status: 'PAID',
    paymentMethod: 'BANK'
  });

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVoucher(newVoucher);
    setShowVoucherModal(false);
    setNewVoucher({
      date: new Date().toISOString().split('T')[0],
      type: 'PAYMENT',
      account: 'CASH',
      amount: 0,
      description: '',
      category: 'General'
    });
  };

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStaff = staff.find(s => s.id === newSalary.staffId);
    if (selectedStaff) {
      onAddSalary({ ...newSalary, staffName: selectedStaff.name });
      setShowSalaryModal(false);
      setNewSalary({
        staffId: '',
        staffName: '',
        amount: 0,
        month: 'November',
        date: new Date().toISOString().split('T')[0],
        status: 'PAID',
        paymentMethod: 'BANK'
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit gap-1 border border-slate-200 shadow-inner">
        <button 
          onClick={() => setActiveTab('balances')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'balances' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Cash & Bank
        </button>
        <button 
          onClick={() => setActiveTab('vouchers')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vouchers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Vouchers
        </button>
        <button 
          onClick={() => setActiveTab('salaries')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'salaries' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Payroll
        </button>
      </div>

      {activeTab === 'balances' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">🏦</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Balance</p>
                <h4 className="text-2xl font-black text-slate-900">₹{balances.bank.toLocaleString()}</h4>
              </div>
            </div>
            <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-3/4"></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">💵</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash in Hand</p>
                <h4 className="text-2xl font-black text-slate-900">₹{balances.cash.toLocaleString()}</h4>
              </div>
            </div>
            <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-1/2"></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">🪙</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Petty Cash</p>
                <h4 className="text-2xl font-black text-slate-900">₹{balances.pettyCash.toLocaleString()}</h4>
              </div>
            </div>
            <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-1/4"></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vouchers' && (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900">Voucher Ledger</h3>
            <button 
              onClick={() => setShowVoucherModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              + New Voucher
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4 px-4">Date</th>
                  <th className="pb-4 px-4">Type</th>
                  <th className="pb-4 px-4">Account</th>
                  <th className="pb-4 px-4">Category</th>
                  <th className="pb-4 px-4">Description</th>
                  <th className="pb-4 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vouchers.map(v => (
                  <tr key={v.id} className="text-sm font-bold text-slate-900 group hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-4">{v.date}</td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest ${
                        v.type === 'RECEIPT' ? 'bg-emerald-50 text-emerald-600' : 
                        v.type === 'PAYMENT' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {v.type}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-slate-500">{v.account.replace('_', ' ')}</td>
                    <td className="py-5 px-4 text-slate-500">{v.category}</td>
                    <td className="py-5 px-4 max-w-xs truncate">{v.description}</td>
                    <td className="py-5 px-4 text-right font-black">₹{v.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'salaries' && (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900">Staff Payroll</h3>
            <button 
              onClick={() => setShowSalaryModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              + Pay Salary
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4 px-4">Staff Name</th>
                  <th className="pb-4 px-4">Month</th>
                  <th className="pb-4 px-4">Date</th>
                  <th className="pb-4 px-4">Method</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {salaries.map(s => (
                  <tr key={s.id} className="text-sm font-bold text-slate-900 group hover:bg-slate-50 transition-colors">
                    <td className="py-5 px-4">{s.staffName}</td>
                    <td className="py-5 px-4 text-slate-500">{s.month}</td>
                    <td className="py-5 px-4 text-slate-500">{s.date}</td>
                    <td className="py-5 px-4 text-slate-500">{s.paymentMethod}</td>
                    <td className="py-5 px-4">
                      <span className="px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-600">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right font-black">₹{s.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-8">New Voucher Entry</h3>
            <form onSubmit={handleVoucherSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input required type="date" value={newVoucher.date} onChange={e => setNewVoucher({...newVoucher, date: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                  <select value={newVoucher.type} onChange={e => setNewVoucher({...newVoucher, type: e.target.value as VoucherType})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none">
                    <option value="PAYMENT">Payment</option>
                    <option value="RECEIPT">Receipt</option>
                    <option value="JOURNAL">Journal</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account</label>
                  <select value={newVoucher.account} onChange={e => setNewVoucher({...newVoucher, account: e.target.value as AccountType})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none">
                    <option value="BANK">Bank Account</option>
                    <option value="CASH">Cash in Hand</option>
                    <option value="PETTY_CASH">Petty Cash</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input required type="number" value={newVoucher.amount} onChange={e => setNewVoucher({...newVoucher, amount: Number(e.target.value)})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <input required type="text" value={newVoucher.category} onChange={e => setNewVoucher({...newVoucher, category: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none" placeholder="e.g. Maintenance, Salary, Repairs" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea required value={newVoucher.description} onChange={e => setNewVoucher({...newVoucher, description: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none h-24 resize-none" placeholder="Details of the transaction..." />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowVoucherModal(false)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Post Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-8">Process Salary Payment</h3>
            <form onSubmit={handleSalarySubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Staff Member</label>
                <select required value={newSalary.staffId} onChange={e => setNewSalary({...newSalary, staffId: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none">
                  <option value="">Choose Staff...</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Month</label>
                  <select value={newSalary.month} onChange={e => setNewSalary({...newSalary, month: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none">
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input required type="number" value={newSalary.amount} onChange={e => setNewSalary({...newSalary, amount: Number(e.target.value)})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                  <input required type="date" value={newSalary.date} onChange={e => setNewSalary({...newSalary, date: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Method</label>
                  <select value={newSalary.paymentMethod} onChange={e => setNewSalary({...newSalary, paymentMethod: e.target.value as AccountType})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-sm outline-none">
                    <option value="BANK">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowSalaryModal(false)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
