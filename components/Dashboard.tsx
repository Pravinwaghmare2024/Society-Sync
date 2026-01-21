
import React from 'react';
import { UserRole, MaintenanceRecord, Complaint, Notice } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  role: UserRole;
  maintenance: MaintenanceRecord[];
  complaints: Complaint[];
  notices: Notice[];
}

const Dashboard: React.FC<DashboardProps> = ({ role, maintenance, complaints, notices }) => {
  const isAdmin = role === UserRole.ADMIN;

  const stats = [
    { label: 'Unpaid Bills', value: maintenance.filter(m => m.status !== 'PAID').length, icon: '💸', color: 'bg-red-100 text-red-600' },
    { label: 'Pending Complaints', value: complaints.filter(c => c.status !== 'RESOLVED').length, icon: '🛠️', color: 'bg-orange-100 text-orange-600' },
    { label: 'Active Notices', value: notices.length, icon: '📢', color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Units', value: '120', icon: '🏢', color: 'bg-indigo-100 text-indigo-600' },
  ];

  const chartData = [
    { name: 'Aug', amount: 4000 },
    { name: 'Sep', amount: 3000 },
    { name: 'Oct', amount: 5000 },
    { name: 'Nov', amount: 4500 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500">Here's what's happening in your society today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600">
            📍 Grand View Residency
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Maintenance Collection Trend</h3>
            <select className="bg-slate-50 border-none rounded-lg text-sm font-medium px-3 py-1">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#6366f1' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Announcement</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              The Annual General Body Meeting (AGM) is scheduled for next Sunday at 10:00 AM in the clubhouse. All members are requested to attend.
            </p>
          </div>
          <div className="mt-8 relative z-10">
            <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
              Read Details
            </button>
          </div>
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
