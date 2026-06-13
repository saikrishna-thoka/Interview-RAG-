import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft, Cpu, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Auth() {
  const { activeView, setActiveView, login, signup } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (activeView === 'login') {
      if (!password) {
        setError('Password is required');
        return;
      }
      login(email, password);
    } else if (activeView === 'signup') {
      if (!name) {
        setError('Name is required');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      signup(email, password, name);
    } else if (activeView === 'forgot-password') {
      setSuccessMsg('Reset instructions sent! Please check your inbox.');
    }
  };

  const handleGoogleLogin = () => {
    // Mock login via Google
    login('google.candidate@gmail.com', 'google-sso-token-xyz');
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full radial-glow opacity-50 pointer-events-none" />

      {/* Card container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 border border-border shadow-2xl relative z-10"
      >
        {/* Back to landing */}
        <button 
          onClick={() => setActiveView('landing')}
          className="inline-flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-600 p-2.5 rounded-2xl text-white mb-3 shadow-md">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {activeView === 'login' && 'Welcome Back'}
            {activeView === 'signup' && 'Create Your Account'}
            {activeView === 'forgot-password' && 'Reset Password'}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {activeView === 'login' && 'Log in to access your interview dashboard'}
            {activeView === 'signup' && 'Sign up to start practicing personalized RAG interviews'}
            {activeView === 'forgot-password' && 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {/* Error / Success alerts */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs flex items-center space-x-2 animate-pulse">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeView === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe" 
                  className="w-full h-10 pl-10 pr-4 bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full h-10 pl-10 pr-4 bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
              />
            </div>
          </div>

          {activeView !== 'forgot-password' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
                {activeView === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setActiveView('forgot-password')} 
                    className="text-[10px] text-indigo-500 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-10 pl-10 pr-4 bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {activeView === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full h-10 pl-10 pr-4 bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-md mt-6 flex items-center justify-center"
          >
            {activeView === 'login' && 'Log In'}
            {activeView === 'signup' && 'Create Account'}
            {activeView === 'forgot-password' && 'Send Reset Link'}
          </button>
        </form>

        {activeView !== 'forgot-password' && (
          <>
            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute w-full h-[1px] bg-border" />
              <span className="relative z-10 px-3 bg-card text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Or Continue With
              </span>
            </div>

            {/* Google OAuth mockup */}
            <button 
              onClick={handleGoogleLogin}
              className="w-full h-11 border border-border bg-muted/20 hover:bg-muted/50 rounded-xl flex items-center justify-center space-x-3 text-sm font-semibold transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </>
        )}

        {/* Toggle link */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          {activeView === 'login' && (
            <span>
              Don't have an account?{' '}
              <button 
                onClick={() => setActiveView('signup')} 
                className="text-indigo-500 hover:underline font-semibold"
              >
                Sign Up
              </button>
            </span>
          )}
          {activeView === 'signup' && (
            <span>
              Already have an account?{' '}
              <button 
                onClick={() => setActiveView('login')} 
                className="text-indigo-500 hover:underline font-semibold"
              >
                Log In
              </button>
            </span>
          )}
          {activeView === 'forgot-password' && (
            <span>
              Remembered your password?{' '}
              <button 
                onClick={() => setActiveView('login')} 
                className="text-indigo-500 hover:underline font-semibold"
              >
                Log In
              </button>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
