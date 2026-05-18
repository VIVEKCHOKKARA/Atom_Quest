import React from 'react';
import { useStore } from '../store/Store';
import { LayoutDashboard, Target, CheckSquare, BarChart, Settings, Users, LogOut, FileText, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export const Layout = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, setCurrentUser, systemMonth, setSystemMonth } = useStore();

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const getNavItems = () => {
    switch(currentUser.role) {
      case 'Employee':
        return [
          { name: 'My Goals', icon: Target, id: 'employee-goals' },
          { name: 'Quarterly Check-ins', icon: CheckSquare, id: 'employee-checkins' },
          { name: 'Goal Alignment', icon: FileText, id: 'employee-alignment' },
          { name: 'Performance Insights', icon: BarChart, id: 'employee-analytics' },
          { name: 'My Audit Trails', icon: Settings, id: 'employee-audit' }
        ];
      case 'Manager':
        return [
          { name: 'Team Goal Sheets', icon: Users, id: 'manager-reviews' },
          { name: 'Goal Cascade (Push)', icon: FileText, id: 'manager-push' },
          { name: 'Team Check-ins', icon: CheckSquare, id: 'manager-checkins' },
          { name: 'Team Performance', icon: BarChart, id: 'manager-analytics' },
          { name: 'Team Audit Trails', icon: Settings, id: 'manager-audit' }
        ];
      case 'Admin':
        return [
          { name: 'KPI Dashboard', icon: BarChart, id: 'admin-dashboard' },
          { name: 'Exception Handling', icon: Settings, id: 'admin-exceptions' },
          { name: 'Audit Logs', icon: FileText, id: 'admin-audit' },
          { name: 'Escalations Manager', icon: AlertTriangle, id: 'admin-escalations' },
          { name: 'Compliance Heatmaps', icon: LayoutDashboard, id: 'admin-heatmaps' }
        ];
      default: return [];
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-lg">G</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">GoalTracker</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {getNavItems().map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                activeTab === item.id 
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" 
                  : "hover:bg-slate-800 hover:text-teal-400 text-slate-400"
              )}>
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">In-House Goal Setting & Tracking Portal</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-sm text-slate-500 font-medium whitespace-nowrap">Simulated Month:</span>
              <select 
                value={systemMonth} 
                onChange={(e) => setSystemMonth(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-teal-700 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="May">May (Goal Setting)</option>
                <option value="July">July (Q1 Check-in)</option>
                <option value="October">October (Q2 Check-in)</option>
                <option value="January">January (Q3 Check-in)</option>
                <option value="March">March/April (Q4 Check-in)</option>
              </select>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
