
import React, { useState } from 'react';
import { User, UserRole, DocumentType, UserDocument } from '../types.ts';

interface DocumentsProps {
  user: User;
  allUsers: User[];
  onUpdateDocuments: (userId: string, docs: UserDocument[]) => void;
  requiredTypes: string[];
}

const Documents: React.FC<DocumentsProps> = ({ user, allUsers, onUpdateDocuments, requiredTypes }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [otherLabel, setOtherLabel] = useState('');

  const handleFileUpload = (type: string, customLabel?: string) => {
    setUploadingType(type);
    setTimeout(() => {
      const currentDocs = user.documents || [];
      const updatedDocs = currentDocs.filter(d => d.type !== type || (type === 'OTHER' && d.customLabel !== customLabel));
      updatedDocs.push({
        type,
        status: 'UPLOADED',
        fileName: `${customLabel || type.toLowerCase()}_${user.username}_${Date.now().toString().slice(-4)}.pdf`,
        uploadDate: new Date().toISOString().split('T')[0],
        customLabel
      });
      onUpdateDocuments(user.id, updatedDocs);
      setUploadingType(null);
      setIsAddingOther(false);
      setOtherLabel('');
    }, 1200);
  };

  const handleVerify = (userId: string, docToVerify: UserDocument) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;
    const updatedDocs = (targetUser.documents || []).map(d => 
      (d.type === docToVerify.type && d.customLabel === docToVerify.customLabel) 
        ? { ...d, status: 'VERIFIED' as const, verifiedBy: user.name } 
        : d
    );
    onUpdateDocuments(userId, updatedDocs);
  };

  if (isAdmin) {
    const pendingVerifications = allUsers.filter(u => u.documents?.some(d => d.status === 'UPLOADED'));

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Auditor</h2>
          <p className="text-slate-500">Global review of resident compliance documentation.</p>
        </div>

        {pendingVerifications.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center shadow-sm">
            <div className="text-5xl mb-6">📂</div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Vault Secure</h3>
            <p className="text-slate-400 font-bold text-xs mt-2">NO PENDING UPLOADS DETECTED IN THE PIPELINE</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingVerifications.map(u => (
              <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{u.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit {u.unit} • Status: {u.residencyType}</p>
                  </div>
                  <span className="bg-indigo-600 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-xl">Action Required</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {u.documents?.filter(d => d.status === 'UPLOADED').map((d, idx) => (
                    <div key={idx} className="flex items-center gap-5 bg-slate-50 p-5 rounded-3xl border border-slate-100 group hover:border-indigo-300 transition-all">
                      <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">📄</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.customLabel || d.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{d.fileName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleVerify(u.id, d)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-100">Verify</button>
                        <button className="bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Inspect</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Vault</h2>
          <p className="text-slate-500 font-medium">Your encrypted documentation repository.</p>
        </div>
        <button 
          onClick={() => setIsAddingOther(!isAddingOther)}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100"
        >
          {isAddingOther ? 'Cancel Upload' : 'Upload Other File'}
        </button>
      </div>

      {isAddingOther && (
        <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 animate-in slide-in-from-top-4">
           <h4 className="font-black text-indigo-900 mb-4 text-sm uppercase tracking-widest">Submit Supporting Documentation</h4>
           <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Document Label (e.g. Electric Bill, Gas Pipeline)"
                value={otherLabel}
                onChange={e => setOtherLabel(e.target.value)}
                className="flex-1 bg-white p-4 rounded-2xl font-bold text-sm outline-none shadow-sm"
              />
              <button 
                onClick={() => handleFileUpload('OTHER', otherLabel)}
                disabled={!otherLabel.trim() || uploadingType === 'OTHER'}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
              >
                {uploadingType === 'OTHER' ? 'Syncing...' : 'Sync to Cloud'}
              </button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...requiredTypes, ...((user.documents || []).filter(d => !requiredTypes.includes(d.type)).map(d => d.customLabel || d.type))].map((typeName, idx) => {
          const doc = user.documents?.find(d => d.type === typeName || d.customLabel === typeName);
          const isUploading = uploadingType === typeName;
          
          return (
            <div key={idx} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all relative">
              <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 transition-all ${
                doc?.status === 'VERIFIED' ? 'bg-green-100 text-green-600' :
                doc?.status === 'UPLOADED' ? 'bg-indigo-100 text-indigo-600' :
                'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
              }`}>
                {typeName.includes('AADHAR') ? '🪪' : typeName.includes('POLICE') ? '👮' : '📑'}
              </div>
              <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-[0.2em]">{typeName.replace(/_/g, ' ')}</h3>
              <p className="text-[10px] text-slate-400 mb-10 font-bold uppercase tracking-widest">
                {requiredTypes.includes(typeName) ? 'Mandatory Requirement' : 'Supporting Evidence'}
              </p>

              <div className="w-full mt-auto">
                {doc?.status === 'VERIFIED' ? (
                  <div className="bg-green-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    Identity Verified ✓
                  </div>
                ) : doc?.status === 'UPLOADED' ? (
                  <div className="bg-indigo-50 text-indigo-700 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    Awaiting Auditor Sync
                  </div>
                ) : (
                  <button
                    onClick={() => handleFileUpload(typeName)}
                    disabled={isUploading}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading Segment...' : 'Attach Document'}
                  </button>
                )}
              </div>

              {doc?.fileName && (
                <div className="mt-4 p-2 bg-slate-50 rounded-lg w-full">
                  <p className="text-[9px] font-mono text-slate-400 truncate">{doc.fileName}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Documents;
