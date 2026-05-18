import React, { useState } from 'react';
import { useStore } from '../store/Store';
import { Search, UserCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function ManagerReviews() {
  const { currentUser, users, goalSheets, goalItems, updateGoalSheetStatus, updateGoalItem } = useStore();
  
  // Find direct reports
  const directReports = users.filter(u => u.manager_id === currentUser.id);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');

  // Get selected user's sheet and items
  const sheet = selectedUser ? goalSheets.find(s => s.user_id === selectedUser.id) : null;
  const items = sheet ? goalItems.filter(i => i.sheet_id === sheet.id) : [];

  const handleApprove = () => {
    const totalWeightage = items.reduce((sum, item) => sum + (Number(item.weightage) || 0), 0);
    if (totalWeightage !== 100) {
      setError(`Cannot approve. Total weightage is ${totalWeightage}%, must be exactly 100%.`);
      return;
    }
    updateGoalSheetStatus(sheet.id, 'Locked', currentUser.id);
    setError('');
  };

  const handleReturn = () => {
    updateGoalSheetStatus(sheet.id, 'Rework', currentUser.id);
    setError('');
  };

  const handleInlineEdit = (id, field, value) => {
    updateGoalItem(id, { [field]: value }, currentUser.id);
    setError('');
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Draft': 'bg-slate-100 text-slate-600',
      'Pending Approval': 'bg-amber-100 text-amber-700',
      'Locked': 'bg-emerald-100 text-emerald-700',
      'Rework': 'bg-rose-100 text-rose-700'
    };
    return (
      <span className={clsx("px-2.5 py-1 rounded-md text-xs font-semibold", styles[status] || styles['Draft'])}>
        {status || 'Draft'}
      </span>
    );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Pane - List */}
      <div className="w-1/3 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Team Reviews</h3>
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search team..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {directReports.map(emp => {
            const empSheet = goalSheets.find(s => s.user_id === emp.id);
            const status = empSheet?.status || 'Draft';
            const isSelected = selectedUser?.id === emp.id;
            return (
              <button 
                key={emp.id}
                onClick={() => setSelectedUser(emp)}
                className={clsx(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                  isSelected ? "bg-teal-50 ring-1 ring-teal-500/20" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <UserCircle className={clsx("w-8 h-8", isSelected ? "text-teal-600" : "text-slate-400")} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{emp.name}</p>
                    <p className="text-xs text-slate-500">Goal Cycle: 2026-H1</p>
                  </div>
                </div>
                {getStatusBadge(status)}
              </button>
            );
          })}
          {directReports.length === 0 && <p className="text-sm text-slate-500 p-4">No direct reports found.</p>}
        </div>
      </div>

      {/* Right Pane - Details */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {selectedUser ? (
          <>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedUser.name}'s Goals</h2>
                <p className="text-sm text-slate-500 mt-1">Review, adjust targets, and approve.</p>
              </div>
              <div className="flex items-center gap-3">
                {sheet?.status === 'Pending Approval' && (
                  <>
                    <button onClick={handleReturn} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors">
                      <XCircle className="w-4 h-4" /> Return for Rework
                    </button>
                    <button onClick={handleApprove} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-colors">
                      <CheckCircle className="w-4 h-4" /> Approve & Lock
                    </button>
                  </>
                )}
                {sheet?.status === 'Locked' && (
                  <span className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                    <CheckCircle className="w-4 h-4" /> Approved (Locked)
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="flex items-center gap-3 p-4 mb-6 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="font-medium text-sm">{error}</p>
                </div>
              )}

              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">{item.thrust_area}</span>
                            {item.parent_goal_id && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">Cascaded</span>}
                          </div>
                          <h4 className="text-base font-bold text-slate-800">{item.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-slate-500 font-medium mb-1">Target ({item.uom})</p>
                            <input 
                              type="text" 
                              value={item.target}
                              onChange={(e) => handleInlineEdit(item.id, 'target', e.target.value)}
                              disabled={sheet.status === 'Locked'}
                              className="w-24 text-right px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold focus:border-teal-500 outline-none disabled:opacity-60"
                            />
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 font-medium mb-1">Weight (%)</p>
                            <input 
                              type="number" 
                              value={item.weightage}
                              onChange={(e) => handleInlineEdit(item.id, 'weightage', e.target.value)}
                              disabled={sheet.status === 'Locked'}
                              className="w-20 text-right px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold focus:border-teal-500 outline-none disabled:opacity-60"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <UserCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p>No goals submitted yet for this cycle.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <UserCircle className="w-16 h-16 mb-4 text-slate-200" />
            <p className="font-medium text-slate-500">Select a team member to review</p>
          </div>
        )}
      </div>
    </div>
  );
}
