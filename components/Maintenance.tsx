
import React, { useState } from 'react';
import { MaintenanceRecord, UserRole } from '../types';

interface MaintenanceProps {
  role: UserRole;
  records: MaintenanceRecord[];
  onPay: (id: string) => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ role, records, onPay }) => {
  const [filter, setFilter] = useState('ALL');
  const isAdmin = role === UserRole.ADMIN;

  const filteredRecords = records.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Maintenance Records</h2>
          <p className="text-slate-500">View and manage society maintenance dues.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Bill Period</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{record.month} 2023</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{record.unit}</td>
                  <td className="px-6 py-4 text-slate-900 font-bold">₹{record.amount}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{record.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      record.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      record.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {record.status !== 'PAID' && !isAdmin && (
                      <button
                        onClick={() => onPay(record.id)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                      >
                        Pay Now
                      </button>
                    )}
                    {record.status === 'PAID' && (
                      <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                        <span>📄</span> Receipt
                      </button>
                    )}
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

export default Maintenance;
