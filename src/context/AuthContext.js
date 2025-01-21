import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Checking for existing token...');
    const token = localStorage.getItem('adminToken');
    if (token) {
      console.log('AuthProvider: Found existing token, setting up auth...');
      // Set default axios auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      console.log('AuthProvider: No existing token found');
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    console.log('AuthProvider: Setting up new login...');
    localStorage.setItem('adminToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
    console.log('AuthProvider: Login complete, isAuthenticated:', true);
  };

  const logout = () => {
    console.log('AuthProvider: Logging out...');
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
  };

  // Debug effect to monitor auth state changes
  useEffect(() => {
    console.log('AuthProvider: Auth state changed:', { isAuthenticated, loading });
  }, [isAuthenticated, loading]);

  const value = {
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
