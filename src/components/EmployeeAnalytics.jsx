import React from 'react';
import { useStore } from '../store/Store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, Award, CheckCircle } from 'lucide-react';

export default function EmployeeAnalytics() {
  const { goalItems } = useStore();

  const progressData = [
    { name: 'Q1 Outreach', progress: 85, fill: '#0d9488' },
    { name: 'Sales Margin', progress: 65, fill: '#14b8a6' },
    { name: 'Operations', progress: 90, fill: '#f59e0b' }
  ];

  const quarterlyPerformance = [
    { quarter: 'Q1', Target: 80, Actual: 85 },
    { quarter: 'Q2', Target: 85, Actual: 90 },
    { quarter: 'Q3', Target: 90, Actual: 0 },
    { quarter: 'Q4', Target: 95, Actual: 0 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Performance Insights</h2>
        <p className="text-slate-500 mt-1">Detailed statistical visualization of your target achievements and quarterly cycles.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Target Progress</h3>
            <p className="text-xs text-slate-400">Your current average completion metrics.</p>
          </div>
          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={10} data={progressData}>
                <RadialBar minAngle={15} background clockWise dataKey="progress" />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-xs">
            {progressData.map(p => (
              <div key={p.name} className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">{p.name}</span>
                <span className="font-bold text-slate-800">{p.progress}%</span>
              </div>
            ))}
          </div>
        </div>

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
                <XAxis dataKey="quarter" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="Actual" stroke="#0d9488" fillOpacity={0.15} fill="#0d9488" strokeWidth={3} />
                <Area type="monotone" dataKey="Target" stroke="#cbd5e1" fillOpacity={0.05} fill="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
