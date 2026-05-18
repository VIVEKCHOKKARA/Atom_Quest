import React, { useState } from 'react';
import { useStore } from '../store/Store';
import { Target, Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const { users, setCurrentUser } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
    } else {
      setError('Invalid username or password.');
    }
  };

  const autofill = (role) => {
    if (role === 'admin') { setUsername('admin'); setPassword('password123'); }
    if (role === 'manager') { setUsername('manager'); setPassword('password123'); }
    if (role === 'employee') { setUsername('employee1'); setPassword('password123'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-center text-white">
          <div className="w-16 h-16 bg-teal-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-teal-500/30">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AtomQuest</h1>
          <p className="text-slate-400 mt-2 text-sm">In-House Goal Setting & Tracking Portal</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-colors">
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-500 mb-3 font-semibold uppercase tracking-wider">Quick Testing Credentials</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => autofill('admin')} className="py-2 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">Admin</button>
              <button onClick={() => autofill('manager')} className="py-2 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">Manager</button>
              <button onClick={() => autofill('employee')} className="py-2 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">Employee</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
