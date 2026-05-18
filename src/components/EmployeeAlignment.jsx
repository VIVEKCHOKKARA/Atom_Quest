import React from 'react';
import { useStore } from '../store/Store';
import { Network, ArrowDown, User, ShieldCheck } from 'lucide-react';

export default function EmployeeAlignment() {
  const { users, goalItems, currentUser } = useStore();
  
  // Find goals linked to a parent manager goal
  const alignedGoals = goalItems.filter(item => {
    // Find the sheet owner
    return item.parent_goal_id !== null;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Goal Alignment & Cascades</h2>
        <p className="text-slate-500 mt-1">Trace goals inherited from your skip-level managers and supervisors.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><Network className="w-6 h-6"/></div>
          <div>
            <h3 className="font-bold text-slate-800">Cascade Tree Alignment</h3>
            <p className="text-xs text-slate-400">Visual mapping of organizational parent goals flow.</p>
          </div>
        </div>

        <div className="space-y-6 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {/* Manager Node */}
          <div className="flex items-start gap-4 relative">
            <div className="w-16 h-16 rounded-full bg-slate-950 border-4 border-white flex items-center justify-center text-white z-10 shadow-md">
              <User className="w-6 h-6"/>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm flex-1">
              <span className="text-[10px] bg-teal-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Supervisory Goal Cascade</span>
              <h4 className="font-bold mt-1 text-sm text-slate-100">Establish Strategic Growth Vectors (Manager L1)</h4>
              <p className="text-xs text-slate-400 mt-1">Core directive to amplify organizational operational safety & revenue across Q1-Q4 cycles.</p>
            </div>
          </div>

          <div className="pl-6 flex justify-start my-2">
            <ArrowDown className="w-5 h-5 text-slate-400 animate-bounce" />
          </div>

          {/* Employee Node */}
          <div className="flex items-start gap-4 relative">
            <div className="w-16 h-16 rounded-full bg-teal-500 border-4 border-white flex items-center justify-center text-white z-10 shadow-md">
              <ShieldCheck className="w-6 h-6"/>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex-1">
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Aligned Child Goal (Inherited)</span>
              <h4 className="font-bold text-slate-800 mt-1 text-sm">Increase Sales & Q1 Outreach (Employee)</h4>
              <p className="text-xs text-slate-500 mt-1">Assigned Unit of Measurement: <strong>Numeric (100 Target)</strong>. Mandated weightage threshold constraint applied: <strong>10% Minimum</strong>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
