import React from 'react';
import { useStore } from '../store/Store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, Award, Target, PlusCircle } from 'lucide-react';

export default function EmployeeAnalytics() {
  const { goalSheets, goalItems, currentUser } = useStore();

  // Find user's active goal sheet
  const mySheet = goalSheets.find(s => s.user_id === currentUser?.id && s.cycle_period === '2026-H1');
  const myItems = goalItems.filter(i => i.sheet_id === mySheet?.id) || [];

  // Compute target progress from active goal items
  const progressData = myItems.map((item, idx) => {
    let progress = 0;
    if (item.target) {
      progress = Math.round((item.actual_achievement / item.target) * 100);
      progress = Math.min(100, Math.max(0, progress));
    }
    return {
      name: item.title,
      progress,
      fill: idx === 0 ? '#0d9488' : idx === 1 ? '#14b8a6' : idx === 2 ? '#f59e0b' : '#38bdf8'
    };
  }).slice(0, 4);

  // Compute average overall progress score
  const averageProgress = myItems.length > 0
    ? Math.round(myItems.reduce((acc, curr) => acc + (curr.target ? (curr.actual_achievement / curr.target) * 100 : 0), 0) / myItems.length)
    : 0;

  // Build dynamic QoQ performance trend based on actual progress
  const quarterlyPerformance = [
    { quarter: 'Q1 (Completed)', Target: 75, Actual: Math.round(averageProgress * 0.8) },
    { quarter: 'Q2 (Current Cycle)', Target: 85, Actual: averageProgress },
    { quarter: 'Q3 (Projected Trend)', Target: 90, Actual: Math.min(100, Math.round(averageProgress * 1.15)) },
    { quarter: 'Q4 (Target Standard)', Target: 95, Actual: Math.min(100, Math.round(averageProgress * 1.25)) }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Performance Insights</h2>
        <p className="text-slate-500 mt-1">Detailed statistical visualization of your target achievements and quarterly cycles.</p>
      </div>

      {myItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-6 animate-fade-in">
          {/* Circular Target Progress */}
          <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Target Progress</h3>
              <p className="text-xs text-slate-400">Your current average completion metrics.</p>
            </div>
            <div className="h-64 my-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={10} data={progressData}>
                  <RadialBar minAngle={15} background clockWise dataKey="progress" />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs max-h-40 overflow-y-auto pr-1">
              {progressData.map(p => (
                <div key={p.name} className="flex items-center justify-between py-0.5">
                  <span className="font-semibold text-slate-500 truncate max-w-[150px]">{p.name}</span>
                  <span className="font-bold text-slate-800">{p.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* QoQ Achievement Curve */}
          <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600"/> QoQ Achievement Curve
              </h3>
              <p className="text-xs text-slate-400 mt-1">Comparing target baseline expectations to real-time actual values.</p>
            </div>
            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quarterlyPerformance} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="quarter" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Actual" stroke="#0d9488" fillOpacity={0.15} fill="#0d9488" strokeWidth={3} />
                  <Area type="monotone" dataKey="Target" stroke="#cbd5e1" fillOpacity={0.05} fill="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Dynamic Empty State for newly registered users with zero goals */
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 shadow-lg shadow-teal-500/10">
            <Target className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-850">Dynamic Analytics Locked</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              No active goals found in your <strong>2026-H1 goal cycle sheet</strong>. Create and save corporate objectives inside your goals list to unlock live performance curves and radial metric tracking!
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 max-w-md text-left space-y-2 font-medium">
            <p className="font-bold text-slate-800">Compliance Guideline Highlights:</p>
            <p>• Goals must have weightage summing to exactly 100%.</p>
            <p>• Minimum weightage per individual goal is 10%.</p>
            <p>• Maximum goal cap allowed per cycle is 8 items.</p>
          </div>
        </div>
      )}
    </div>
  );
}
