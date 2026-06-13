import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';

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
  const { theme, setTheme, activeView, user } = useAppStore();

  // Initialize theme class on mount
  useEffect(() => {
    setTheme(theme);
  }, []);

  // Standalone pages (Landing + Auth flow)
  if (activeView === 'landing') {
    return <LandingPage />;
  }

  if (['login', 'signup', 'forgot-password'].includes(activeView)) {
    return <Auth />;
  }

  // Dashboard pages wrapped in DashboardLayout
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
