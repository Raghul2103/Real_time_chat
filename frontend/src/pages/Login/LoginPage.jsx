import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/chat');
    } catch (err) {
      setError(err || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-[#070a13] px-4 py-12 text-slate-800 dark:text-slate-100">
      {/* Decorative Blur Spheres */}
      <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-indigo-600/10 blur-[100px]"></div>
      <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px]"></div>

      {/* Main Glass Panel */}
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center">
          {/* Logo Brand */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-chat-textMuted">
            Sign in to access your chat channels
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Error Message Box */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                Email Address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full rounded-xl border border-slate-200 dark:border-chat-border bg-white dark:bg-slate-900/50 py-3 pl-10 pr-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 dark:border-chat-border bg-white dark:bg-slate-900/50 py-3 pl-10 pr-10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:from-indigo-600 hover:to-purple-700 hover:shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500 dark:text-chat-textMuted">Don't have an account? </span>
          <Link
            to="/register"
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition duration-150"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
