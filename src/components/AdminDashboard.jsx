import React, { useState } from 'react';
import { useStore } from '../store/Store';
import { Download, Unlock, Clock, FileText, AlertTriangle, Search, Activity, BarChart2, ShieldAlert, Settings2, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export default function AdminDashboard({ view = 'dashboard' }) {
  const { users, goalSheets, auditTrails, updateGoalSheetStatus } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [escalationBanner, setEscalationBanner] = useState(false);
  const [escalationThreshold, setEscalationThreshold] = useState(7); // default 7 days threshold
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Analytics Calculations
  const employees = users.filter(u => u.role === 'Employee');
  const totalEmployees = employees.length;
  const lockedCount = goalSheets.filter(s => s.status === 'Locked').length;
  const draftCount = goalSheets.filter(s => s.status === 'Draft' || !s.status).length;
  const pendingCount = goalSheets.filter(s => s.status === 'Pending Approval').length;
  const reworkCount = goalSheets.filter(s => s.status === 'Rework').length;
  const unstartedCount = totalEmployees - goalSheets.filter(s => employees.some(e => e.id === s.user_id)).length;

  const completionData = [
    { name: 'Locked (Approved)', value: lockedCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Draft/Rework', value: draftCount + reworkCount + unstartedCount, color: '#94a3b8' }
  ];

  const { goalItems } = useStore();

  // Dynamically compute Thrust Area Distribution
  const thrustCounts = {};
  goalItems.forEach(item => {
    const area = item.thrust_area || 'Other';
    thrustCounts[area] = (thrustCounts[area] || 0) + 1;
  });
  const totalGoalItems = goalItems.length || 1;
  const colorPalette = ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4', '#2dd4bf'];
  const thrustData = Object.keys(thrustCounts).length > 0
    ? Object.keys(thrustCounts).map((area, idx) => ({
        name: area,
        value: Math.round((thrustCounts[area] / totalGoalItems) * 100),
        color: colorPalette[idx % colorPalette.length]
      }))
    : [
        { name: 'Revenue', value: 30, color: '#0d9488' },
        { name: 'Operations', value: 25, color: '#14b8a6' },
        { name: 'Safety', value: 20, color: '#5eead4' },
        { name: 'Quality', value: 25, color: '#99f6e4' }
      ];

  // Dynamically compute Thrust vs UoM Distribution
  const uomCounts = {};
  goalItems.forEach(item => {
    const area = item.thrust_area || 'Other';
    const uom = item.uom || 'Numeric';
    if (!uomCounts[area]) {
      uomCounts[area] = { Numeric: 0, Timeline: 0, Zero: 0 };
    }
    if (uomCounts[area][uom] !== undefined) {
      uomCounts[area][uom]++;
    }
  });
  const distributionData = Object.keys(uomCounts).length > 0
    ? Object.keys(uomCounts).map(area => ({
        name: area,
        Numeric: uomCounts[area].Numeric || 0,
        Timeline: uomCounts[area].Timeline || 0,
        Zero: uomCounts[area].Zero || 0
      }))
    : [
        { name: 'Revenue', Numeric: 4, Timeline: 1, Zero: 0 },
        { name: 'Operations', Numeric: 2, Timeline: 3, Zero: 1 },
        { name: 'Safety', Numeric: 0, Timeline: 1, Zero: 4 },
        { name: 'Quality', Numeric: 2, Timeline: 2, Zero: 0 }
      ];

  const submissionRate = Math.round(((totalEmployees - unstartedCount) / totalEmployees) * 100) || 0;
  const approvalRate = Math.round((lockedCount / totalEmployees) * 100) || 0;

  // Dynamically compute Compliance Heatmap Data based on actual employees
  const heatmapData = employees.map(emp => {
    const sheet = goalSheets.find(s => s.user_id === emp.id);
    const items = goalItems.filter(i => i.sheet_id === sheet?.id) || [];
    const isGoalCapCompliant = items.length <= 8;
    const totalWeight = items.reduce((acc, curr) => acc + (curr.weightage || 0), 0);
    const isWeightageCompliant = items.length > 0 ? (totalWeight === 100) : true;
    return {
      id: emp.id,
      name: emp.name,
      goalCap: isGoalCapCompliant,
      weightage: isWeightageCompliant,
      itemsCount: items.length,
      totalWeight
    };
  });

  const goalCapComplianceRate = heatmapData.length > 0
    ? Math.round((heatmapData.filter(c => c.goalCap).length / heatmapData.length) * 100)
    : 100;
  const weightageComplianceRate = heatmapData.length > 0
    ? Math.round((heatmapData.filter(c => c.weightage).length / heatmapData.length) * 100)
    : 100;

  const handleUnlock = (sheetId) => {
    updateGoalSheetStatus(sheetId, 'Draft', 'Admin');
  };

  const handleSimulateEscalation = () => {
    setEscalationBanner(true);
    setTimeout(() => setEscalationBanner(false), 5000);
  };

  const handleRefreshMockData = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleExportCSV = () => {
    const headers = ['Employee Name', 'Role', 'Goal Status', 'Cycle'];
    const rows = users.filter(u => u.role === 'Employee').map(emp => {
      const sheet = goalSheets.find(s => s.user_id === emp.id);
      return [emp.name, emp.role, sheet?.status || 'Not Started', '2026-H1'].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "completion_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Operator', 'Target Record', 'Field', 'Old Value', 'New Value'];
    const rows = auditTrails.map(log => {
      return [
        new Date(log.timestamp).toLocaleString().replace(/,/g, ''),
        log.operator,
        log.target,
        log.field_changed,
        String(log.old_value || 'null'),
        String(log.new_value)
      ].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "audit_trail.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render KPI Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Total Employees</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Activity className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalEmployees}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Locked & Approved</h3>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><FileText className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{lockedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Pending Approval</h3>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Action Required</h3>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><AlertTriangle className="w-5 h-5"/></div>
          </div>
          <p className="text-3xl font-bold text-rose-600">{draftCount + reworkCount + unstartedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Completion Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={completionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {completionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {completionData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-bold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-800">Goal Distribution & Cycle Rates</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="text-center">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee Submission Rate</h4>
              <div className="relative w-28 h-28 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-teal-500" strokeDasharray={`${submissionRate}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-800">{submissionRate}%</div>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Manager Approval Rate</h4>
              <div className="relative w-28 h-28 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeDasharray={`${approvalRate}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-800">{approvalRate}%</div>
              </div>
            </div>
          </div>

          <div className="h-56">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Thrust Area vs. UoM Type</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Numeric" stackId="a" fill="#0d9488" />
                <Bar dataKey="Timeline" stackId="a" fill="#94a3b8" />
                <Bar dataKey="Zero" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Exception Handling Tab
  const renderExceptions = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Exception Handling & Overrides</h3>
          <p className="text-sm text-slate-500 mt-1">Unlock locked employee goal sheets to allow emergency updates.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search employee..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 w-64 transition-all" 
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Goal Cycle</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Emergency Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {goalSheets
              .filter(s => users.find(u => u.id === s.user_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(sheet => {
                const emp = users.find(u => u.id === sheet.user_id);
                return (
                  <tr key={sheet.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{emp?.name}</td>
                    <td className="px-6 py-4 text-slate-500">{emp?.role}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{sheet.cycle_period}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sheet.status === 'Locked' ? 'bg-emerald-100 text-emerald-700' : sheet.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {sheet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sheet.status === 'Locked' ? (
                        <button onClick={() => handleUnlock(sheet.id)} className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 ml-auto bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors">
                          <Unlock className="w-4 h-4" /> Unlock Sheet
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold">Active Edit Phase</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Audit Trail logs Tab
  const renderAudit = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Immutable Audit Trail</h3>
          <p className="text-sm text-slate-500 mt-1">Authorized ledger of goal-setting transactions and system alterations.</p>
        </div>
        <button onClick={handleExportAuditCSV} className="flex items-center gap-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export Audit CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Operator</th>
              <th className="px-6 py-4">Target Record</th>
              <th className="px-6 py-4">Modified Field</th>
              <th className="px-6 py-4">Old State</th>
              <th className="px-6 py-4">New State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditTrails.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-semibold">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{log.operator}</td>
                <td className="px-6 py-4 text-slate-600 font-medium">{log.target}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono font-bold text-slate-700">{log.field_changed}</span>
                </td>
                <td className="px-6 py-4 text-rose-600 line-through font-medium">{String(log.old_value || 'null')}</td>
                <td className="px-6 py-4 text-emerald-600 font-bold">{String(log.new_value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Escalation Tab
  const renderEscalations = () => (
    <div className="space-y-6">
      {escalationBanner && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <div>
              <h4 className="font-bold">Escalation Rules Fired Successfully!</h4>
              <p className="text-sm">Automated email alerts & MS Teams notifications have been pushed to <strong>1 Manager</strong> for goal approvals pending past {escalationThreshold} days.</p>
            </div>
          </div>
          <button onClick={() => setEscalationBanner(false)} className="text-amber-600 font-bold hover:text-amber-900 text-sm">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-800">Escalation Settings</h3>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Escalation Trigger Threshold</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="3" 
                max="14" 
                value={escalationThreshold} 
                onChange={(e) => setEscalationThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <span className="text-sm font-bold text-slate-800 whitespace-nowrap">{escalationThreshold} Days</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Flag delayed goal approvals or unsubmitted drafts past this period to skip-level manager.</p>
          </div>
          <button 
            onClick={handleSimulateEscalation}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-colors"
          >
            <AlertTriangle className="w-4 h-4" /> Simulate Escalation Scan
          </button>
        </div>

        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold text-slate-800">Flagged Delays (Escalation Queue)</h3>
            </div>
            <button onClick={handleRefreshMockData} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
            </button>
          </div>
          <div className="p-6">
            <div className="rounded-xl border border-slate-100 overflow-hidden text-sm">
              <div className="grid grid-cols-4 bg-slate-50 p-3 font-semibold text-slate-500 border-b border-slate-100">
                <div>Employee</div>
                <div>Manager</div>
                <div>Delay (Days)</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-slate-100">
                {goalSheets
                  .filter(s => s.status === 'Draft' || s.status === 'Pending Approval')
                  .map(s => {
                    const emp = users.find(u => u.id === s.user_id);
                    const mgr = users.find(u => u.id === emp?.manager_id);
                    const isDraft = s.status === 'Draft';
                    const delayDays = isDraft ? 9 : 4;
                    if (!emp) return null;
                    return (
                      <div key={s.id} className="grid grid-cols-4 p-3 items-center hover:bg-slate-50/50 transition-colors">
                        <div className="font-bold text-slate-800">{emp.name}</div>
                        <div className="text-slate-600 font-medium">{mgr?.name || 'Alice Admin'}</div>
                        <div className={`font-bold ${isDraft ? 'text-rose-600' : 'text-amber-600'}`}>{delayDays} Days</div>
                        <div>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${isDraft ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            {isDraft ? 'Draft Delay' : 'Pending Approval'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                {goalSheets.filter(s => s.status === 'Draft' || s.status === 'Pending Approval').length === 0 && (
                  <div className="p-4 text-center text-slate-400 italic">No delayed sheets found in queue. All systems green!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Heatmaps Tab
  const renderHeatmaps = () => (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" /> Organizational Heatmaps & Compliance Breakdown
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-700">Goal Cap Enforcement (Max 8 Goals)</p>
              <span className="text-xs font-bold text-emerald-600">{goalCapComplianceRate}% Compliance Rate</span>
            </div>
            <div className="grid grid-cols-10 gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              {heatmapData.map(cell => (
                <div key={`cap-${cell.id}`} className={`w-full pt-[100%] rounded-lg shadow-sm border transition-all hover:scale-105 ${cell.goalCap ? 'bg-emerald-400 border-emerald-500' : 'bg-rose-400 border-rose-500'}`} title={`${cell.name}: ${cell.goalCap ? 'Compliant (<=8 goals)' : 'Violation (Cap Exceeded)'}`} />
              ))}
              {heatmapData.length === 0 && (
                <p className="text-slate-400 text-xs py-2 col-span-10 text-center italic">No employee data found.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-700">Weightage Compliance (Exactly 100% Total, Min 10% Indiv)</p>
              <span className="text-xs font-bold text-emerald-600">{weightageComplianceRate}% Compliance Rate</span>
            </div>
            <div className="grid grid-cols-10 gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              {heatmapData.map(cell => (
                <div key={`weight-${cell.id}`} className={`w-full pt-[100%] rounded-lg shadow-sm border transition-all hover:scale-105 ${cell.weightage ? 'bg-emerald-400 border-emerald-500' : 'bg-rose-400 border-rose-500'}`} title={`${cell.name}: ${cell.weightage ? 'Compliant (100% total)' : 'Violation (Weightage mismatch)'}`} />
              ))}
              {heatmapData.length === 0 && (
                <p className="text-slate-400 text-xs py-2 col-span-10 text-center italic">No employee data found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Data Breakdown</h3>
          <p className="text-xs text-slate-400">Total metrics allocated by organization core Thrust Areas.</p>
        </div>
        <div className="h-64 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={thrustData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                {thrustData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          {thrustData.map(t => (
            <div key={t.name} className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">{t.name} Allocation</span>
              <span className="font-bold text-slate-800">{t.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const getPageHeader = () => {
    switch (view) {
      case 'dashboard': return { title: 'KPI Dashboard', desc: 'System-wide active performance, analytics, and metrics.' };
      case 'exceptions': return { title: 'Exception Override', desc: 'Administrative locked sheet overrides and operational controls.' };
      case 'audit': return { title: 'Audit Trail Logs', desc: 'Immutable, secure transaction ledgers.' };
      case 'escalations': return { title: 'Escalations Manager', desc: 'Chronological approval triggers and rules configurator.' };
      case 'heatmaps': return { title: 'Compliance Heatmaps', desc: 'Visual corporate rule enforcement and breakdowns.' };
      default: return { title: 'Admin Governance', desc: '' };
    }
  };

  const header = getPageHeader();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{header.title}</h2>
          <p className="text-slate-500 mt-1 font-medium">{header.desc}</p>
        </div>
        <div className="flex items-center gap-3">
          {view === 'dashboard' && (
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors">
              <Download className="w-4 h-4" /> Export Report
            </button>
          )}
        </div>
      </div>

      {view === 'dashboard' && renderDashboard()}
      {view === 'exceptions' && renderExceptions()}
      {view === 'audit' && renderAudit()}
      {view === 'escalations' && renderEscalations()}
      {view === 'heatmaps' && renderHeatmaps()}
    </div>
  );
}
