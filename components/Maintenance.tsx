
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

  const downloadReceipt = (record: MaintenanceRecord) => {
    const societyName = "Grand View Residency";
    const receiptHtml = `
      <html>
        <head>
          <title>Maintenance Receipt - ${record.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .receipt-container { max-width: 600px; margin: auto; border: 2px solid #f1f5f9; padding: 40px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
            .society-name { font-size: 24px; font-weight: 800; color: #4f46e5; margin: 0; }
            .receipt-title { text-transform: uppercase; letter-spacing: 2px; font-size: 12px; font-weight: 700; color: #94a3b8; margin-top: 5px; }
            .details { margin-bottom: 30px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px border-slate-50; }
            .label { font-weight: 600; color: #64748b; }
            .value { font-weight: 800; color: #1e293b; }
            .amount-section { background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; margin-top: 20px; }
            .amount-label { font-size: 14px; color: #64748b; font-weight: 600; }
            .amount-value { font-size: 32px; font-weight: 900; color: #1e293b; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; pt: 20px; }
            .stamp { width: 100px; height: 100px; border: 4px solid #10b981; border-radius: 50%; display: flex; items-center: center; justify-content: center; font-weight: 900; color: #10b981; text-transform: uppercase; transform: rotate(-15deg); margin: 20px auto; opacity: 0.6; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h1 class="society-name">${societyName}</h1>
              <div class="receipt-title">Official Payment Receipt</div>
            </div>
            <div class="details">
              <div class="detail-row"><span class="label">Receipt No:</span> <span class="value">REC-${record.id.toUpperCase()}</span></div>
              <div class="detail-row"><span class="label">Unit Number:</span> <span class="value">${record.unit}</span></div>
              <div class="detail-row"><span class="label">Billing Month:</span> <span class="value">${record.month} 2023</span></div>
              <div class="detail-row"><span class="label">Payment Date:</span> <span class="value">${record.paidDate || 'N/A'}</span></div>
            </div>
            <div class="amount-section">
              <div class="amount-label">Amount Paid</div>
              <div class="amount-value">₹${record.amount.toLocaleString()}</div>
            </div>
            <div class="stamp">PAID</div>
            <div class="footer">
              <p>Thank you for your timely payment. This is a computer-generated receipt and does not require a physical signature.</p>
              <p>&copy; 2023 ${societyName} Management</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${record.unit}_${record.month}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
                      <button 
                        onClick={() => downloadReceipt(record)}
                        className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline group"
                      >
                        <span className="group-hover:scale-110 transition-transform">📄</span> Receipt
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
