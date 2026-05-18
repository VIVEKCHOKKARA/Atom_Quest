import React from 'react';
import { useStore } from '../store/Store';
import { History } from 'lucide-react';

export default function ManagerAudit() {
  const { auditTrails } = useStore();

  // Filter logs where operator is 'Bob Manager' or related to manager's direct reports (Charlie / Diana)
  const managerAuditLogs = auditTrails.filter(log => {
    return log.operator === 'Bob Manager' || log.target.includes('gs1') || log.target.includes('gs2');
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Direct Reports Audit Ledger</h2>
        <p className="text-slate-500 mt-1">Immutable transaction logs specifically tracing alterations done by or targeting your direct reports.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-teal-600"/>
          <h3 className="text-lg font-bold text-slate-800">Team Activity Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Modified Target</th>
                <th className="px-6 py-4">Field</th>
                <th className="px-6 py-4">Previous State</th>
                <th className="px-6 py-4">New State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {managerAuditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-semibold">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{log.operator}</td>
                  <td className="px-6 py-4 text-slate-600 font-semibold">{log.target}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono font-bold">{log.field_changed}</span>
                  </td>
                  <td className="px-6 py-4 text-rose-600 line-through font-medium">{String(log.old_value || 'null')}</td>
                  <td className="px-6 py-4 text-emerald-600 font-bold">{String(log.new_value)}</td>
                </tr>
              ))}
              {managerAuditLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">No historical transactions logged for this direct hierarchy profile yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
