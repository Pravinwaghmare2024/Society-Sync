
import React, { useState } from 'react';
import { Complaint, UserRole } from '../types.ts';
import { analyzeComplaint } from '../services/geminiService.ts';

interface ComplaintsProps {
  role: UserRole;
  complaints: Complaint[];
  categories: string[];
  addComplaint: (complaint: Partial<Complaint>) => void;
  updateStatus: (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => void;
}

const Complaints: React.FC<ComplaintsProps> = ({ role, complaints, categories, addComplaint, updateStatus }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0] || 'General');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isAdmin = role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    const analysis = await analyzeComplaint(description);

    addComplaint({
      title,
      description,
      category,
      aiPriority: analysis.priority,
      aiSummary: analysis.summary
    });

    setIsFormOpen(false);
    setTitle('');
    setDescription('');
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Complaint Register</h2>
          <p className="text-slate-500">Track and resolve issues in the society.</p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            {isFormOpen ? 'Cancel Request' : 'New Support Request'}
          </button>
        )}
      </div>

      {!isAdmin && isFormOpen && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Subject</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary of the problem"
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-bold outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Other">Other / General</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe exactly what happened..."
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 font-medium resize-none outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full md:w-auto bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100"
            >
              {isAnalyzing ? 'AI Routing System Active...' : 'Register Support Ticket'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {complaints.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center">
             <div className="text-4xl mb-4">📭</div>
             <p className="text-slate-500 font-bold">No active support tickets found.</p>
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 md:items-center group hover:border-indigo-100 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    c.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                    c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {c.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">#{c.id.slice(-4)} • {c.createdAt}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{c.title}</h3>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Category: {c.category}</p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-sm text-slate-600 font-medium italic">"{c.aiSummary || c.description}"</p>
                </div>
                {isAdmin && (
                  <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Reporter: {c.residentName} (Unit {c.unit})</p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {isAdmin && c.status !== 'RESOLVED' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => updateStatus(c.id, 'IN_PROGRESS')}
                      className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100"
                    >
                      Allocate Staff
                    </button>
                    <button
                      onClick={() => updateStatus(c.id, 'RESOLVED')}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700"
                    >
                      Resolve Issue
                    </button>
                  </div>
                )}
                {c.status === 'RESOLVED' && (
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-green-100">
                    Completed ✓
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Complaints;
