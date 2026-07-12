import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import ChatPage from '../pages/Chat/ChatPage';

// Guard for authenticated access
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
          <div className="absolute h-10 w-10 animate-ping rounded-full border border-purple-500/30"></div>
        </div>
        <p className="mt-6 text-sm font-medium tracking-wide text-indigo-600/80 dark:text-indigo-200/70 animate-pulse">
          Establishing secure connection...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Guard for unauthenticated access (Redirects to chat if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      
      {/* Fallback redirects */}
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
};

export default AppRoutes;
