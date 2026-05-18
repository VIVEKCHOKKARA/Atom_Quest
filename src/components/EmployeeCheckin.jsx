import React, { useState } from 'react';
import { useStore } from '../store/Store';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function EmployeeCheckin() {
  const { currentUser, goalSheets, goalItems, updateGoalItem, systemMonth } = useStore();
  
  const getActiveQuarter = () => {
    switch(systemMonth) {
      case 'July': return 'Q1';
      case 'October': return 'Q2';
      case 'January': return 'Q3';
      case 'March': return 'Q4';
      default: return null;
    }
  };

  const activeQuarter = getActiveQuarter();
  const [error, setError] = useState('');

  const sheet = goalSheets.find(s => s.user_id === currentUser.id && s.cycle_period === '2026-H1');
  const items = sheet ? goalItems.filter(i => i.sheet_id === sheet.id) : [];

  const handleUpdate = (id, field, value) => {
    updateGoalItem(id, { [field]: value }, currentUser.id);
  };

  const calculateProgress = (item) => {
    const target = Number(item.target) || 1;
    const actual = Number(item.actual_achievement) || 0;
    
    if (item.uom === 'Min (Numeric/%)') {
      return Math.min(100, Math.round((actual / target) * 100));
    }
    if (item.uom === 'Max (Numeric/%)') {
      if (actual === 0) return 100; // prevent divide by zero, technically lower is better
      return Math.min(100, Math.round((target / actual) * 100));
    }
    if (item.uom === 'Zero-based') {
      return actual === 0 ? 100 : 0;
    }
    if (item.uom === 'Timeline') {
      // simplified comparison
      return item.status === 'Completed' ? 100 : 0;
    }
    return 0;
  };

  if (!sheet) {
    return <div className="text-slate-500">No active goal sheet found.</div>;
  }

  if (sheet.status !== 'Locked') {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50 border border-slate-200 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Sheet Not Locked</h3>
        <p className="text-slate-500">Your goal sheet must be approved and locked by your manager before check-ins.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quarterly Check-ins</h2>
          <p className="text-slate-500 mt-1">Log your progress and actual achievements.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600">Active Quarter:</span>
          <span className="bg-slate-100 text-teal-700 border border-teal-200 rounded-lg px-3 py-1.5 text-sm font-bold shadow-sm">
            {activeQuarter || 'None Open'}
          </span>
        </div>
      </div>

      {!activeQuarter ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white border border-slate-200 rounded-2xl">
          <Clock className="w-10 h-10 text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800">Check-in Window Closed</h3>
          <p className="text-sm text-slate-500">The current system month ({systemMonth}) does not have an active check-in period.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
        {items.map(item => {
          const progress = calculateProgress(item);
          return (
            <div key={item.id} className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-600">{item.thrust_area}</span>
                </div>
                <h4 className="text-base font-bold text-slate-800">{item.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={clsx("h-full rounded-full transition-all duration-500", progress >= 100 ? "bg-emerald-500" : progress > 0 ? "bg-teal-500" : "bg-transparent")} 
                      style={{ width: `${Math.max(progress, 0)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{progress}%</span>
                </div>
              </div>

              <div className="w-80 space-y-4 border-l border-slate-100 pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Planned Target</span>
                  <span className="font-bold text-slate-800">{item.target} {item.uom}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Actual Achievement</label>
                  <input 
                    type={item.uom === 'Timeline' ? 'date' : 'text'}
                    value={item.actual_achievement}
                    onChange={(e) => handleUpdate(item.id, 'actual_achievement', e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                  <select 
                    value={item.status}
                    onChange={(e) => handleUpdate(item.id, 'status', e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  >
                    <option>Not Started</option>
                    <option>On Track</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}
      
      {activeQuarter && (
        <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-colors">
            <CheckCircle2 className="w-4 h-4" /> Save {activeQuarter} Updates
          </button>
        </div>
      )}
    </div>
  );
}
