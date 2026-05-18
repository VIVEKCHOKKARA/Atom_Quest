import React from 'react';
import { useStore } from '../store/Store';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Users, Award } from 'lucide-react';

export default function ManagerAnalytics() {
  const { users, goalSheets } = useStore();

  // Seed metrics data for team
  const teamMetrics = [
    { name: 'Charlie Employee', 'Q1 Progress': 85, 'Q2 Progress': 60 },
    { name: 'Diana Employee', 'Q1 Progress': 90, 'Q2 Progress': 75 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Team Performance Insights</h2>
        <p className="text-slate-500 mt-1">Holistic organizational performance dashboards mapping department goals.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600"/> Team Capacity
            </h3>
            <p className="text-xs text-slate-400">Total active team profiles monitored.</p>
          </div>
          <div className="py-6 text-center">
            <p className="text-6xl font-extrabold text-slate-900">2</p>
            <p className="text-xs text-slate-400 mt-2">Active direct reports mapped in database.</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Charlie Employee</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Diana Employee</span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600"/> Team Completion Comparison
            </h3>
            <p className="text-xs text-slate-400 mt-1">Cross-referencing real-time progress percentages across direct reports.</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamMetrics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Q1 Progress" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Q2 Progress" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
