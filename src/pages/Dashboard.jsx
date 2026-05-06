import React, { useState } from 'react';
import ActivityTracking from '../components/ActivityTracking';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import FoodTracking from '@/components/FoodTracking';
import MedicationManagement from '@/components/MedicationManagement';
import WaterIntake from '@/components/WaterIntake';
import NotificationCenter from '@/components/NotificationCenter';
import ProgressReports from '@/pages/ProgressReports';
import ProfilePage from '@/pages/ProfilePage';
import { Toaster } from '@/components/ui/toaster';
import { 
  Home, 
  Utensils, 
  Pill, 
  TrendingUp, 
  User, 
  LogOut, 
  Menu, 
  X,
  Droplet,
  Bell,
  Activity
} from 'lucide-react';

const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'food', label: 'Food Tracking', icon: Utensils },
  { id: 'water', label: 'Water Intake', icon: Droplet },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };
<QuickStatCard
          title="Activity Tracking"
          description="Log your daily workouts and active minutes"
          icon={Activity}
          color="from-orange-500 to-red-600"
          delay={0.35}
        />
  const renderContent = () => {
    switch (activeSection) {
      case 'food':
        return <FoodTracking />;
      case 'water':
        return <WaterIntake />;
      case 'activity':
        return <ActivityTracking />;
      case 'medications':
        return <MedicationManagement />;
      case 'notifications':
        return <NotificationCenter />;
      case 'progress':
        return <ProgressReports />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Health Freak</title>
        <meta name="description" content="Your health tracking dashboard" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {sidebarOpen ? (
                    <X className="w-6 h-6 text-gray-400" />
                  ) : (
                    <Menu className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Health Freak
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">{currentUser?.email}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex">
          {/* Sidebar */}
          <AnimatePresence>
            {(sidebarOpen || window.innerWidth >= 1024) && (
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700 overflow-y-auto z-40"
              >
                <nav className="p-4 space-y-2">
                  {NAVIGATION_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20'
                            : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <Toaster />
      </div>
    </>
  );
};

const DashboardHome = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Welcome back! 👋</h1>
        <p className="text-gray-400">Here's your health overview</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <QuickStatCard
          title="Food Tracking"
          description="Log your daily meals and track calories"
          icon={Utensils}
          color="from-cyan-500 to-blue-600"
          delay={0.1}
        />
        <QuickStatCard
          title="Water Intake"
          description="Stay hydrated throughout the day"
          icon={Droplet}
          color="from-blue-500 to-cyan-600"
          delay={0.2}
        />
        <QuickStatCard
          title="Medications"
          description="Manage your medications and reminders"
          icon={Pill}
          color="from-purple-500 to-pink-600"
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-500/20 rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-2">Quick Tips 💡</h2>
        <ul className="space-y-2 text-gray-300">
          <li>• Aim for 8 glasses of water (2000ml) daily</li>
          <li>• Track all your meals for better calorie awareness</li>
          <li>• Set medication reminders to never miss a dose</li>
          <li>• Check your progress reports weekly to stay on track</li>
        </ul>
      </motion.div>
    </div>
  );
};

const QuickStatCard = ({ title, description, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
  >
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </motion.div>
);

export default Dashboard;