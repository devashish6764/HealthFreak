import React from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import { Toaster } from '@/components/ui/toaster';
import AlexChat from './components/AlexChat';

function AppContent() {
  const { isAuthenticated } = useAuth(); //

  if (!isAuthenticated) {
    return <LoginPage />; //
  }

  return (
    <div className="app-container">
      <Dashboard /> 
      {/* Floating AI Assistant added here */}
      <AlexChat /> 
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;