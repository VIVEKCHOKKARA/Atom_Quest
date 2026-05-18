import React, { useState } from 'react';
import { useStore } from '../store/Store';
import { UserCircle, Search, CheckCircle, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

export default function ManagerCheckin() {
  const { currentUser, users, goalSheets, goalItems } = useStore();
  
  const directReports = users.filter(u => u.manager_id === currentUser.id);
  const [selectedUser, setSelectedUser] = useState(null);
  const [comment, setComment] = useState('');
  const [quarter, setQuarter] = useState('Q1');
  const [error, setError] = useState('');

  const sheet = selectedUser ? goalSheets.find(s => s.user_id === selectedUser.id) : null;
  const items = sheet ? goalItems.filter(i => i.sheet_id === sheet.id) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("A Structured Check-in Comment is required before submitting.");
      return;
    }
    // Simulate save
    alert(`Quarterly Review for ${quarter} submitted successfully for ${selectedUser.name}.`);
    setComment('');
    setError('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Pane - List */}
      <div className="w-1/3 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Team Check-ins</h3>
          <select value={quarter} onChange={e => setQuarter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs font-bold focus:outline-none">
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {directReports.map(emp => {
            const isSelected = selectedUser?.id === emp.id;
            return (
              <button 
                key={emp.id}
                onClick={() => setSelectedUser(emp)}
                className={clsx(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                  isSelected ? "bg-teal-50 ring-1 ring-teal-500/20" : "hover:bg-slate-50"
                )}
              >
                <UserCircle className={clsx("w-8 h-8", isSelected ? "text-teal-600" : "text-slate-400")} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{emp.name}</p>
                  <p className="text-xs text-slate-500">Employee</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Pane */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {selectedUser ? (
          <>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">{selectedUser.name}'s {quarter} Review</h2>
              <p className="text-sm text-slate-500 mt-1">Review actual achievements vs planned targets.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Goal Title</th>
                      <th className="px-4 py-3">Planned Target</th>
                      <th className="px-4 py-3 border-l border-slate-200 bg-teal-50/50 text-teal-800">Actual Achievement</th>
                      <th className="px-4 py-3 bg-teal-50/50 text-teal-800">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800">{item.title}</td>
                        <td className="px-4 py-3">{item.target} {item.uom}</td>
                        <td className="px-4 py-3 border-l border-slate-200 bg-teal-50/20 font-bold text-teal-700">
                          {item.actual_achievement || '0'} {item.uom}
                        </td>
                        <td className="px-4 py-3 bg-teal-50/20">
                          <span className={clsx("px-2 py-1 rounded text-xs font-semibold", 
                            item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            item.status === 'On Track' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          )}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No goals found for this employee.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  <h3>Structured Check-in Comment</h3>
                </div>
                {error && <p className="text-sm text-rose-600 mb-3 font-medium">{error}</p>}
                <textarea 
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-teal-500 min-h-[100px] mb-4"
                  placeholder="Summarize the employee's performance, areas of improvement, and coaching provided..."
                />
                <div className="flex justify-end">
                  <button type="submit" className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-colors">
                    <CheckCircle className="w-4 h-4" /> Submit Review
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <UserCircle className="w-16 h-16 mb-4 text-slate-200" />
            <p className="font-medium text-slate-500">Select a team member for check-in</p>
          </div>
        )}
      </div>
    </div>
  );
}
