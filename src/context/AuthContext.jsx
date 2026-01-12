import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, logoutUser, createUser } from '@/utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const user = loginUser(email, password);
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, username) => {
    try {
      const { user } = createUser(email, password, username);
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginRedirect />;
  }
  
  return children;
};

const LoginRedirect = () => {
  useEffect(() => {
    window.location.href = '/';
  }, []);
  
  return null;
};