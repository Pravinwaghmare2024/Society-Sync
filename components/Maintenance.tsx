
import React, { useState } from 'react';
import { MaintenanceRecord, UserRole } from '../types.ts';

interface MaintenanceProps {
  role: UserRole;
  records: MaintenanceRecord[];
  onPay: (id: string, transactionId?: string, fileName?: string) => void;
  onVerify?: (id: string, status: 'PAID' | 'PENDING') => void;
  society: SocietySettings;
}

const Maintenance: React.FC<MaintenanceProps> = ({ role, records, onPay, onVerify, society }) => {
  const [filter, setFilter] = useState('ALL');
  const [showProofModal, setShowProofModal] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [uploading, setUploading] = useState(false);
  const isAdmin = role === UserRole.ADMIN;

  const filteredRecords = records.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showProofModal) return;
    setUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      onPay(showProofModal, transactionId, `receipt_${showProofModal}.pdf`);
      setUploading(false);
      setShowProofModal(null);
      setTransactionId('');
    }, 1500);
  };

  const downloadReceipt = (record: MaintenanceRecord) => {
    const societyName = society.name;
    const societyLogo = society.logoUrl;
    const receiptHtml = `
      <html>
        <head>
          <title>Maintenance Receipt - ${record.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; background: #f8fafc; }
            .receipt-container { max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 32px; background: white; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px; }
            .logo-container { width: 80px; height: 80px; background: #4f46e5; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; overflow: hidden; }
            .logo-container img { width: 100%; height: 100%; object-fit: cover; }
            .logo-placeholder { color: white; font-size: 32px; font-weight: 900; }
            .society-name { font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.02em; }
            .receipt-title { text-transform: uppercase; letter-spacing: 3px; font-size: 11px; font-weight: 800; color: #6366f1; margin-top: 8px; }
            .details { margin-bottom: 40px; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f8fafc; }
            .label { font-weight: 600; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
            .value { font-weight: 800; color: #1e293b; font-size: 14px; }
            .amount-section { background: #f1f5f9; padding: 30px; border-radius: 24px; text-align: center; margin-top: 20px; border: 1px solid #e2e8f0; }
            .amount-label { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 5px; }
            .amount-value { font-size: 40px; font-weight: 900; color: #0f172a; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 30px; }
            .stamp { width: 120px; height: 120px; border: 6px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #10b981; text-transform: uppercase; transform: rotate(-15deg); margin: 30px auto; opacity: 0.4; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="logo-container">
                ${societyLogo ? `<img src="${societyLogo}" alt="Logo" />` : `<div class="logo-placeholder">${societyName[0]}</div>`}
              </div>
              <h1 class="society-name">${societyName}</h1>
              <div class="receipt-title">Official Payment Receipt</div>
            </div>
            <div class="details">
              <div class="detail-row"><span class="label">Receipt No:</span> <span class="value">REC-${record.id.toUpperCase()}</span></div>
              <div class="detail-row"><span class="label">Unit Number:</span> <span class="value">${record.unit}</span></div>
              <div class="detail-row"><span class="label">Billing Month:</span> <span class="value">${record.month} 2023</span></div>
              <div class="detail-row"><span class="label">Transaction ID:</span> <span class="value">${record.transactionId || 'INTERNAL'}</span></div>
              <div class="detail-row"><span class="label">Payment Date:</span> <span class="value">${record.paidDate || 'N/A'}</span></div>
            </div>
            <div class="amount-section">
              <div class="amount-label">Total Amount Paid</div>
              <div class="amount-value">₹${record.amount.toLocaleString()}</div>
            </div>
            <div class="stamp">PAID</div>
            <div class="footer">
              <p>Thank you for your timely payment. This is a computer-generated receipt and does not require a physical signature.</p>
              <p>&copy; 2023 ${societyName} Management System</p>
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
          {['ALL', 'PENDING', 'PAID', 'OVERDUE', 'AWAITING_APPROVAL'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'AWAITING_APPROVAL' ? 'Pending Review' : f.charAt(0) + f.slice(1).toLowerCase()}
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
                      record.status === 'AWAITING_APPROVAL' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {record.status === 'AWAITING_APPROVAL' ? 'Reviewing' : record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {!isAdmin && (record.status === 'PENDING' || record.status === 'OVERDUE') && (
                      <button
                        onClick={() => setShowProofModal(record.id)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                      >
                        Submit Proof
                      </button>
                    )}
                    {!isAdmin && record.status === 'AWAITING_APPROVAL' && (
                      <span className="text-xs font-bold text-slate-400 italic">Verifying Receipt...</span>
                    )}
                    {isAdmin && record.status === 'AWAITING_APPROVAL' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onVerify?.(record.id, 'PAID')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onVerify?.(record.id, 'PENDING')}
                          className="bg-rose-100 text-rose-600 px-3 py-1 rounded text-xs font-bold hover:bg-rose-200"
                        >
                          Reject
                        </button>
                      </div>
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

      {showProofModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Submit Payment Info</h3>
              <p className="text-slate-500 text-sm mb-6">Enter your transaction details for verification.</p>
              
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Transaction ID / Reference</label>
                  <input
                    required
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. UPI-9988776655"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Upload Receipt Image</label>
                  <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 transition-colors">
                    <span className="text-2xl mb-2">📸</span>
                    <span className="text-xs font-bold text-slate-500">Click to Select File</span>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG or PDF up to 5MB</span>
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {uploading ? 'Processing...' : 'Submit for Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProofModal(null)}
                    className="px-6 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
