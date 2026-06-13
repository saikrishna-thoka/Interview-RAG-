import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Cpu } from 'lucide-react';

// View components
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './components/DashboardHome';
import ResumeUpload from './components/ResumeUpload';
import ResumeAnalysis from './components/ResumeAnalysis';
import InterviewSetup from './components/InterviewSetup';
import InterviewChat from './components/InterviewChat';
import InterviewCompletion from './components/InterviewCompletion';
import Reports from './components/Reports';
import Settings from './components/Settings';

export default function App() {
  const { theme, setTheme, activeView, setActiveView, user, authInitialized, initializeAuth } = useAppStore();

  // Initialize theme class and auth session listeners on mount
  useEffect(() => {
    setTheme(theme);
    initializeAuth();
  }, []);

  // Display a loading backdrop while Supabase checks the active session
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-slate-200">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
          <Cpu className="w-6 h-6 text-indigo-500 absolute top-5 left-5 animate-pulse" />
        </div>
        <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">Synchronizing Session...</p>
      </div>
    );
  }

  // Standalone public pages (Landing + Auth forms)
  if (activeView === 'landing') {
    return <LandingPage />;
  }

  if (['login', 'signup', 'forgot-password'].includes(activeView)) {
    return <Auth />;
  }

  // Protected Route Boundary: Redirect to landing if unauthenticated user attempts to access dashboard
  if (!user) {
    // Force set view back to landing asynchronously to prevent React render warnings
    setTimeout(() => {
      setActiveView('landing');
    }, 0);
    return <LandingPage />;
  }

  // Authenticated workspace pages wrapped inside DashboardLayout
  return (
    <DashboardLayout>
      {activeView === 'dashboard' && <DashboardHome />}
      {activeView === 'upload' && <ResumeUpload />}
      {activeView === 'analysis' && <ResumeAnalysis />}
      {activeView === 'setup' && <InterviewSetup />}
      {activeView === 'chat' && <InterviewChat />}
      {activeView === 'completion' && <InterviewCompletion />}
      {activeView === 'reports' && <Reports />}
      {activeView === 'settings' && <Settings />}
    </DashboardLayout>
  );
}
