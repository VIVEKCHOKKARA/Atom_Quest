import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store/Store';
import { Layout } from './components/Layout';
import EmployeeGoals from './components/EmployeeGoals';
import EmployeeCheckin from './components/EmployeeCheckin';
import EmployeeAlignment from './components/EmployeeAlignment';
import EmployeeAnalytics from './components/EmployeeAnalytics';
import EmployeeAudit from './components/EmployeeAudit';

import ManagerReviews from './components/ManagerReviews';
import SharedGoals from './components/SharedGoals';
import ManagerCheckin from './components/ManagerCheckin';
import ManagerAnalytics from './components/ManagerAnalytics';
import ManagerAudit from './components/ManagerAudit';

import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';

const AppContent = () => {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState('');

  // Set default tab on role switch
  useEffect(() => {
    if (currentUser?.role === 'Employee') setActiveTab('employee-goals');
    else if (currentUser?.role === 'Manager') setActiveTab('manager-reviews');
    else if (currentUser?.role === 'Admin') setActiveTab('admin-dashboard');
  }, [currentUser?.role]);

  const renderContent = () => {
    if (currentUser.role === 'Employee') {
      if (activeTab === 'employee-goals') return <EmployeeGoals />;
      if (activeTab === 'employee-checkins') return <EmployeeCheckin />;
      if (activeTab === 'employee-alignment') return <EmployeeAlignment />;
      if (activeTab === 'employee-analytics') return <EmployeeAnalytics />;
      if (activeTab === 'employee-audit') return <EmployeeAudit />;
    }
    if (currentUser.role === 'Manager') {
      if (activeTab === 'manager-reviews') return <ManagerReviews />;
      if (activeTab === 'manager-push') return <SharedGoals />;
      if (activeTab === 'manager-checkins') return <ManagerCheckin />;
      if (activeTab === 'manager-analytics') return <ManagerAnalytics />;
      if (activeTab === 'manager-audit') return <ManagerAudit />;
    }
    if (currentUser.role === 'Admin') {
      if (activeTab === 'admin-dashboard') return <AdminDashboard view="dashboard" />;
      if (activeTab === 'admin-exceptions') return <AdminDashboard view="exceptions" />;
      if (activeTab === 'admin-audit') return <AdminDashboard view="audit" />;
      if (activeTab === 'admin-escalations') return <AdminDashboard view="escalations" />;
      if (activeTab === 'admin-heatmaps') return <AdminDashboard view="heatmaps" />;
    }
    return null;
  };

  if (!currentUser) return <Login />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
