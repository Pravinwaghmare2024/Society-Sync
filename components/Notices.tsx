
import React, { useState } from 'react';
import { Notice, UserRole } from '../types';
import { generateNoticeContent } from '../services/geminiService';

interface NoticesProps {
  role: UserRole;
  notices: Notice[];
  addNotice: (notice: Partial<Notice>) => void;
}

const Notices: React.FC<NoticesProps> = ({ role, notices, addNotice }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [title, setTitle] = useState('');

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const content = await generateNoticeContent(topic);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const handlePublish = () => {
    addNotice({
      title: title || topic,
      content: generatedContent,
      priority: 'MEDIUM',
      date: new Date().toISOString().split('T')[0],
      author: 'Admin'
    });
    setIsModalOpen(false);
    setTopic('');
    setTitle('');
    setGeneratedContent('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notice Board</h2>
          <p className="text-slate-500">Important updates and announcements.</p>
        </div>
        {role === UserRole.ADMIN && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <span>✨</span> Create Notice
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group">
            <div className="flex items-start justify-between mb-4">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                notice.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                notice.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {notice.priority}
              </span>
              <span className="text-xs text-slate-400 font-medium">{notice.date}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{notice.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{notice.content}</p>
            <div className="mt-6 flex items-center gap-2 border-t border-slate-50 pt-4">
              <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
              <span className="text-xs font-bold text-slate-500">By {notice.author}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">AI Notice Generator</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Topic / Purpose</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Lift maintenance, Yoga classes, Diwali party..."
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {generatedContent ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Final Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                      <textarea
                        rows={6}
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-900 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !topic}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-3"
                    >
                      {isGenerating ? 'AI is writing...' : 'Draft with Gemini AI'}
                      {!isGenerating && <span>🪄</span>}
                    </button>
                  </div>
                )}
              </div>

              {generatedContent && (
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={handlePublish}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                  >
                    Publish to Residents
                  </button>
                  <button
                    onClick={() => setGeneratedContent('')}
                    className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notices;
