import React, { createContext, useState, useEffect, useContext } from 'react';
import customFetch from '../services/customFetch';
import { initSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Synchronize document theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Check if user has active session
  const checkUserSession = async () => {
    try {
      const response = await customFetch.get('/auth/me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
        const socket = initSocket();
        socket.connect();
      }
    } catch (error) {
      // Not logged in or session expired
      console.log('No active session found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
    return () => {
      disconnectSocket();
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await customFetch.post('/auth/login', { email, password });
      if (response.data && response.data.user) {
        setUser(response.data.user);
        const socket = initSocket();
        socket.connect();
        return response.data.user;
      }
    } catch (error) {
      throw error.formattedMessage || 'Login failed';
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    try {
      const response = await customFetch.post('/auth/register', { name, email, password });
      if (response.data && response.data.user) {
        setUser(response.data.user);
        const socket = initSocket();
        socket.connect();
        return response.data.user;
      }
    } catch (error) {
      throw error.formattedMessage || 'Registration failed';
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await customFetch.post('/auth/logout');
    } catch (error) {
      console.error('Logout error on server side:', error);
    } finally {
      setUser(null);
      disconnectSocket();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
