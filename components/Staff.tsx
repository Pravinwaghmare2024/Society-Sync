
import React, { useState } from 'react';
import { StaffMember, StaffRole, UserRole } from '../types';

interface StaffProps {
  role: UserRole;
  staff: StaffMember[];
  userUnit?: string;
  addStaff?: (member: Partial<StaffMember>) => void;
  deleteStaff?: (id: string) => void;
}

const Staff: React.FC<StaffProps> = ({ role, staff, userUnit, addStaff, deleteStaff }) => {
  const isAdmin = role === UserRole.ADMIN;
  const [filter, setFilter] = useState<string>('ALL');

  // Logic to identify resident's floor from unit string like "A-101" -> floor 1
  const residentFloor = userUnit ? parseInt(userUnit.split('-')[1]?.substring(0, 1)) || 1 : null;

  const filteredStaff = staff.filter(s => {
    if (filter === 'ALL') return true;
    return s.role === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Staff Directory</h2>
          <p className="text-slate-500">Contact details and floor allocations for maintenance staff.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['ALL', StaffRole.CLEANING, StaffRole.PLUMBING, StaffRole.ELECTRICAL].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {!isAdmin && residentFloor && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
            ✨ Staff Assigned to Your Floor ({residentFloor})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.filter(s => s.role === StaffRole.CLEANING && s.allocatedFloors.includes(residentFloor)).map(s => (
              <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">Assigned Cleaner • {s.availability}</p>
                </div>
                <a href={`tel:${s.phone}`} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors">
                  📞
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {member.role === StaffRole.CLEANING ? '🧹' : 
                 member.role === StaffRole.ELECTRICAL ? '⚡' : 
                 member.role === StaffRole.PLUMBING ? '🔧' : '👤'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-lg">
                  {member.role}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</span>
                <span className="text-sm font-bold text-slate-900">{member.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hours</span>
                <span className="text-sm font-medium text-slate-600">{member.availability}</span>
              </div>
              {member.role === StaffRole.CLEANING && member.allocatedFloors.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Allocated Floors</span>
                  <div className="flex flex-wrap gap-1">
                    {member.allocatedFloors.map(f => (
                      <span key={f} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md">
                        Floor {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <a 
                href={`tel:${member.phone}`}
                className="flex-1 bg-indigo-50 text-indigo-600 py-3 rounded-2xl font-bold text-center hover:bg-indigo-100 transition-colors"
              >
                Call Staff
              </a>
              {isAdmin && (
                <button 
                  onClick={() => deleteStaff?.(member.id)}
                  className="bg-rose-50 text-rose-600 p-3 rounded-2xl hover:bg-rose-100"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Staff;
