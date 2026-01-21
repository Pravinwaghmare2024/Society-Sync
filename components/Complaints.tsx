
import React, { useState } from 'react';
import { Complaint, UserRole } from '../types';
import { analyzeComplaint } from '../services/geminiService';

interface ComplaintsProps {
  role: UserRole;
  complaints: Complaint[];
  addComplaint: (complaint: Partial<Complaint>) => void;
  updateStatus: (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => void;
}

const Complaints: React.FC<ComplaintsProps> = ({ role, complaints, addComplaint, updateStatus }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isAdmin = role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    // AI analysis
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
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            {isFormOpen ? 'Cancel' : 'Register New Complaint'}
          </button>
        )}
      </div>

      {!isAdmin && isFormOpen && (
        <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summary of the issue"
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 outline-none"
                >
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Security</option>
                  <option>Cleaning</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the problem..."
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 resize-none outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {isAnalyzing ? 'AI Analyzing Priority...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {complaints.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                  c.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                  c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {c.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">{c.createdAt}</span>
                {c.aiPriority && (
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-bold border border-indigo-100">
                    AI Priority: {c.aiPriority}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{c.title}</h3>
              <p className="text-sm text-slate-500 mb-2">Resident: {c.residentName} (Unit {c.unit})</p>
              <p className="text-slate-600 text-sm italic">"{c.aiSummary || c.description}"</p>
            </div>
            
            <div className="flex items-center gap-4">
              {isAdmin && c.status !== 'RESOLVED' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(c.id, 'IN_PROGRESS')}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100"
                  >
                    Start Working
                  </button>
                  <button
                    onClick={() => updateStatus(c.id, 'RESOLVED')}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg font-bold text-sm hover:bg-green-100"
                  >
                    Resolve
                  </button>
                </div>
              )}
              {c.status === 'RESOLVED' && (
                <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                  <span>✅</span> Fixed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Complaints;
