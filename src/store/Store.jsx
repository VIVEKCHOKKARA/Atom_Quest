import React, { createContext, useContext, useState } from 'react';

// Seed Data
const initialUsers = [
  { id: 'u1', username: 'admin', password: 'password123', name: 'Alice Admin', email: 'alice.admin@atomquest.com', role: 'Admin', manager_id: null, isVerified: true },
  { id: 'u2', username: 'manager', password: 'password123', name: 'Bob Manager', email: 'bob.manager@atomquest.com', role: 'Manager', manager_id: 'u1', isVerified: true },
  { id: 'u3', username: 'employee1', password: 'password123', name: 'Charlie Employee', email: 'charlie.employee@atomquest.com', role: 'Employee', manager_id: 'u2', isVerified: true },
  { id: 'u4', username: 'employee2', password: 'password123', name: 'Diana Employee', email: 'diana.employee@atomquest.com', role: 'Employee', manager_id: 'u2', isVerified: true },
];

const initialGoalSheets = [
  { id: 'gs1', user_id: 'u3', cycle_period: '2026-H1', status: 'Draft' }, // Draft
  { id: 'gs2', user_id: 'u4', cycle_period: '2026-H1', status: 'Locked' }, // Locked for Exception Handling
];

const initialGoalItems = [
  {
    id: 'gi1', sheet_id: 'gs1', thrust_area: 'Revenue', title: 'Increase Sales', description: 'Sell more product X',
    uom: 'Numeric', target: 100, weightage: 50, actual_achievement: 0, progress_score: 0, status: 'Not Started', parent_goal_id: null
  }
];

const initialAuditTrails = [
  { id: 'audit_1', timestamp: new Date(Date.now() - 86400000).toISOString(), operator: 'Alice Admin', target: 'gs2', field_changed: 'status', old_value: 'Pending Approval', new_value: 'Locked' },
  { id: 'audit_2', timestamp: new Date(Date.now() - 172800000).toISOString(), operator: 'Bob Manager', target: 'gs2', field_changed: 'status', old_value: 'Draft', new_value: 'Pending Approval' }
];

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUsers);
  const [goalSheets, setGoalSheets] = useState(initialGoalSheets);
  const [goalItems, setGoalItems] = useState(initialGoalItems);
  const [auditTrails, setAuditTrails] = useState(initialAuditTrails);
  
  // Current session & Environment
  const [currentUser, setCurrentUser] = useState(null); // Default null for auth
  const [systemMonth, setSystemMonth] = useState('May'); // Default May for Goal Creation

  // Actions
  const updateGoalSheetStatus = (sheetId, status, operatorId) => {
    setGoalSheets(prev => prev.map(s => {
      if (s.id === sheetId) {
        logAudit(operatorId, sheetId, 'status', s.status, status);
        return { ...s, status };
      }
      return s;
    }));
  };

  const saveGoalItems = (sheetId, items) => {
    setGoalItems(prev => {
      const filtered = prev.filter(i => i.sheet_id !== sheetId);
      return [...filtered, ...items];
    });
  };

  const updateGoalItem = (itemId, updates, operatorId) => {
    setGoalItems(prev => prev.map(item => {
      if (item.id === itemId) {
        Object.keys(updates).forEach(key => {
          if (item[key] !== updates[key]) {
             logAudit(operatorId, `Item ${itemId}`, key, item[key], updates[key]);
          }
        });
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const pushSharedGoal = (managerId, targetUserIds, goalData) => {
    // Generate a master goal (optional, could just be a parent id reference)
    const masterId = 'master_' + Date.now();
    const newItems = targetUserIds.map(uid => {
      // Create or find a draft sheet for the user
      let sheet = goalSheets.find(s => s.user_id === uid && s.cycle_period === '2026-H1');
      let sheetId = sheet ? sheet.id : `gs_${uid}_new`;
      if (!sheet) {
        setGoalSheets(prev => [...prev, { id: sheetId, user_id: uid, cycle_period: '2026-H1', status: 'Draft' }]);
      }
      
      return {
        id: `gi_${Date.now()}_${uid}`,
        sheet_id: sheetId,
        parent_goal_id: masterId,
        ...goalData,
        weightage: 10, // Default weightage
        actual_achievement: 0,
        progress_score: 0,
        status: 'Not Started'
      };
    });
    setGoalItems(prev => [...prev, ...newItems]);
    alert('Shared goals pushed successfully.');
  };

  const logAudit = (operatorId, target, field, oldVal, newVal) => {
    setAuditTrails(prev => [
      { id: `audit_${Date.now()}`, timestamp: new Date().toISOString(), operator: operatorId, target, field_changed: field, old_value: oldVal, new_value: newVal },
      ...prev
    ]);
  };

  const registerUser = (newUser) => {
    setUsers(prev => [...prev, newUser]);
    // Create goal sheet if employee
    if (newUser.role === 'Employee') {
      const sheetId = `gs_${newUser.id}`;
      setGoalSheets(prev => [...prev, { id: sheetId, user_id: newUser.id, cycle_period: '2026-H1', status: 'Draft' }]);
    }
    logAudit(newUser.id, 'User Sign Up', 'registration', '', `User registered: ${newUser.username} (${newUser.role})`);
  };

  const verifyUser = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        logAudit(u.id, 'User Verification', 'isVerified', 'false', 'true');
        return { ...u, isVerified: true };
      }
      return u;
    }));
  };

  const store = {
    users, currentUser, setCurrentUser,
    goalSheets, setGoalSheets, updateGoalSheetStatus,
    goalItems, saveGoalItems, updateGoalItem, pushSharedGoal,
    auditTrails, logAudit,
    systemMonth, setSystemMonth,
    registerUser, verifyUser
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStore = () => useContext(StoreContext);
