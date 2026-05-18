import React, { useState, useEffect } from 'react';
import { useStore } from '../store/Store';
import { Plus, Trash2, Send, AlertCircle, Lock } from 'lucide-react';
import clsx from 'clsx';

const UOM_OPTIONS = ['Min (Numeric/%)', 'Max (Numeric/%)', 'Timeline', 'Zero-based'];

export default function EmployeeGoals() {
  const { currentUser, goalSheets, goalItems, saveGoalItems, updateGoalSheetStatus, systemMonth } = useStore();
  
  const [sheet, setSheet] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let currentSheet = goalSheets.find(s => s.user_id === currentUser.id && s.cycle_period === '2026-H1');
    if (!currentSheet) {
      // For demo, if no sheet, we simulate they haven't started. 
      // But we should auto-create a draft sheet if needed.
    } else {
      setSheet(currentSheet);
      setItems(goalItems.filter(i => i.sheet_id === currentSheet.id));
    }
  }, [currentUser.id, goalSheets, goalItems]);

  const totalWeightage = items.reduce((sum, item) => sum + (Number(item.weightage) || 0), 0);
  const isLocked = sheet?.status === 'Locked' || sheet?.status === 'Pending Approval' || systemMonth !== 'May';

  const handleAddItem = () => {
    if (items.length >= 8) {
      setError("Maximum 8 goals allowed per sheet.");
      return;
    }
    const newItem = {
      id: `gi_new_${Date.now()}`,
      sheet_id: sheet?.id || `gs_${currentUser.id}_new`,
      thrust_area: '',
      title: '',
      description: '',
      uom: 'Min (Numeric/%)',
      target: '',
      weightage: 0,
      actual_achievement: 0,
      progress_score: 0,
      status: 'Not Started',
      parent_goal_id: null
    };
    setItems([...items, newItem]);
    setError('');
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(i => i.id !== id));
    setError('');
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    setError('');
  };

  const handleSubmit = () => {
    if (items.length > 8) {
      setError("Maximum of 8 goals allowed.");
      return;
    }
    if (items.some(i => Number(i.weightage) < 10)) {
      setError("Minimum weightage for any goal must be at least 10%.");
      return;
    }
    if (totalWeightage !== 100) {
      setError(`Total weightage must be exactly 100%. Currently it is ${totalWeightage}%.`);
      return;
    }
    if (items.some(i => !i.title || !i.thrust_area)) {
      setError("Please fill all required fields (Thrust Area, Title).");
      return;
    }

    // Save and submit
    if (!sheet) {
      // Need to create sheet in store (skip for now, assume sheet exists or handle it)
      alert("No active sheet found.");
      return;
    }
    saveGoalItems(sheet.id, items);
    updateGoalSheetStatus(sheet.id, 'Pending Approval', currentUser.id);
  };

  if (!sheet) return <div className="text-slate-500">Loading your goal sheet...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Goal Sheet: {sheet.cycle_period}</h2>
          <p className="text-slate-500 mt-1">Draft your primary objectives for this review cycle.</p>
        </div>
        <div className={clsx(
          "px-4 py-1.5 rounded-full text-sm font-semibold border",
          sheet.status === 'Draft' ? 'bg-slate-100 text-slate-600 border-slate-200' :
          sheet.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700 border-amber-200' :
          sheet.status === 'Locked' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
          'bg-rose-100 text-rose-700 border-rose-200'
        )}>
          {sheet.status}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}
      {systemMonth !== 'May' && (
        <div className="flex items-center gap-3 p-4 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-medium">The Goal Creation window is currently closed for the {systemMonth} tracking cycle. Sheets are locked for check-ins.</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Thrust Area</th>
                <th className="px-4 py-3">Goal Title</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">UoM</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3 text-right">Weight (%)</th>
                {!isLocked && <th className="px-4 py-3 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => {
                const isShared = !!item.parent_goal_id;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={item.thrust_area} 
                        onChange={e => handleItemChange(item.id, 'thrust_area', e.target.value)}
                        disabled={isLocked || isShared}
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 p-1 disabled:opacity-50"
                        placeholder="e.g. Sales"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isShared && <Lock className="w-3 h-3 text-slate-400" title="Cascaded Goal" />}
                        <input 
                          type="text" 
                          value={item.title} 
                          onChange={e => handleItemChange(item.id, 'title', e.target.value)}
                          disabled={isLocked || isShared}
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 p-1 disabled:opacity-50"
                          placeholder="Goal Title"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={item.description} 
                        onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                        disabled={isLocked || isShared}
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 p-1 disabled:opacity-50"
                        placeholder="Brief description"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        value={item.uom}
                        onChange={e => handleItemChange(item.id, 'uom', e.target.value)}
                        disabled={isLocked || isShared}
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 p-1 disabled:opacity-50"
                      >
                        {UOM_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type={item.uom === 'Timeline' ? 'date' : 'text'} 
                        value={item.target} 
                        onChange={e => handleItemChange(item.id, 'target', e.target.value)}
                        disabled={isLocked || isShared}
                        className="w-24 bg-transparent border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 p-1 disabled:opacity-50"
                        placeholder="Target"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        value={item.weightage} 
                        onChange={e => handleItemChange(item.id, 'weightage', e.target.value)}
                        disabled={isLocked}
                        className="w-16 text-right bg-transparent border-0 border-b border-transparent focus:border-teal-500 focus:ring-0 p-1 font-semibold text-slate-700 disabled:opacity-50"
                      />
                    </td>
                    {!isLocked && (
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isShared}
                          className="text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    No goals added yet. Click "Add Goal" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            {!isLocked && (
              <button 
                onClick={handleAddItem}
                className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Goal
              </button>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="text-slate-500 font-medium">Total Weightage:</span>
              <span className={clsx(
                "ml-2 text-lg font-bold",
                totalWeightage === 100 ? "text-emerald-600" : "text-rose-600"
              )}>
                {totalWeightage}%
              </span>
            </div>
            {!isLocked && (
              <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md transition-colors"
              >
                <Send className="w-4 h-4" /> Submit for Approval
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
