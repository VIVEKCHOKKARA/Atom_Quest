import React, { useState } from 'react';
import { useStore } from '../store/Store';
import { Target, Users, Send } from 'lucide-react';
import clsx from 'clsx';

export default function SharedGoals() {
  const { currentUser, users, pushSharedGoal } = useStore();
  
  const [formData, setFormData] = useState({
    thrust_area: 'Company KPI',
    title: '',
    description: '',
    uom: 'Min (Numeric/%)',
    target: ''
  });
  
  const directReports = users.filter(u => u.manager_id === currentUser.id);
  const [selectedUsers, setSelectedUsers] = useState(directReports.map(u => u.id));

  const handlePush = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.target || selectedUsers.length === 0) {
      alert("Please fill all fields and select at least one employee.");
      return;
    }
    pushSharedGoal(currentUser.id, selectedUsers, formData);
    setFormData({ ...formData, title: '', description: '', target: '' });
  };

  const toggleUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Cascade Departmental KPIs</h2>
        <p className="text-slate-500 mt-1">Push standardized shared goals down to your direct reports.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <form onSubmit={handlePush} className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Thrust Area</label>
            <input type="text" value={formData.thrust_area} onChange={e => setFormData({...formData, thrust_area: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Goal Title</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" placeholder="e.g. Q1 Revenue Target" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" rows="3" placeholder="Brief details about the KPI..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">UoM</label>
              <select value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500">
                <option>Min (Numeric/%)</option>
                <option>Max (Numeric/%)</option>
                <option>Timeline</option>
                <option>Zero-based</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target</label>
              <input type={formData.uom === 'Timeline' ? 'date' : 'text'} required value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-colors">
              <Send className="w-4 h-4" /> Push KPI to Team
            </button>
          </div>
        </form>

        <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
            <Users className="w-5 h-5 text-teal-600" />
            <h3>Select Target Employees</h3>
          </div>
          <div className="space-y-2">
            {directReports.map(emp => (
              <label key={emp.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedUsers.includes(emp.id)}
                  onChange={() => toggleUser(emp.id)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{emp.name}</p>
                  <p className="text-xs text-slate-500">{emp.role}</p>
                </div>
              </label>
            ))}
            {directReports.length === 0 && <p className="text-sm text-slate-500">No direct reports found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
