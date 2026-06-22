import React from 'react';
import { useAuth } from '../context/AuthContext';
import TouristDashboard from './dashboards/TouristDashboard';
import FarmerDashboard from './dashboards/FarmerDashboard';
import HomestayDashboard from './dashboards/HomestayDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import Sidebar from '../components/layout/Sidebar';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Tourist does not need the business sidebar layout, they get a full dashboard layout directly
  if (user.role === 'tourist') {
    return <TouristDashboard />;
  }

  // Business/Admin roles get the Sidebar + main dashboard content layout
  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 w-full min-h-[calc(100vh-64px)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-x-hidden">
        {user.role === 'farmer' && <FarmerDashboard />}
        {user.role === 'homestay_owner' && <HomestayDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
};
export default Dashboard;
