import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Upload, Play, MessageSquare, 
  FileBarChart2, Settings, CreditCard, LogOut, 
  Menu, X, Bell, Sun, Moon, User, ChevronRight, CheckCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function DashboardLayout({ children }) {
  const { 
    theme, toggleTheme, activeView, setActiveView, 
    user, logout, notifications, markNotificationsRead, uploadedResume 
  } = useAppStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'upload', label: 'Upload Resume', icon: <Upload className="w-5 h-5" /> },
    { 
      id: 'setup', 
      label: 'Interview Setup', 
      icon: <Play className="w-5 h-5" />, 
      badge: !uploadedResume ? 'Required' : null 
    },
    { 
      id: 'chat', 
      label: 'Interview Chat', 
      icon: <MessageSquare className="w-5 h-5" />,
      hide: activeView !== 'chat' 
    },
    { id: 'reports', label: 'Reports', icon: <FileBarChart2 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (id) => {
    if (id === 'setup' && !uploadedResume) {
      setActiveView('upload');
      return;
    }
    setActiveView(id);
    setMobileOpen(false);
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300 relative overflow-hidden">
      
      {/* Background glow overlay */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full radial-glow opacity-30 pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col flex-shrink-0 glass border-r border-border h-screen sticky top-0 transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center space-x-3 overflow-hidden cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Play className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="font-bold text-sm tracking-tight whitespace-nowrap"
              >
                InterviewRAG <span className="text-indigo-500">AI</span>
              </motion.span>
            )}
          </div>
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.filter(item => !item.hide).map((item) => {
            const isActive = activeView === item.id || 
                            (item.id === 'upload' && activeView === 'analysis') || 
                            (item.id === 'setup' && activeView === 'completion');
            const isDisabled = item.id === 'setup' && !uploadedResume;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full h-11 flex items-center rounded-xl px-3.5 text-sm font-semibold transition-all relative ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                    : isDisabled 
                      ? 'text-muted-foreground/40 cursor-not-allowed hover:bg-transparent'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  {item.icon}
                  {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                </div>
                {sidebarOpen && item.badge && (
                  <span className="absolute right-3.5 top-3 px-2 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/25">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile shortcut */}
        <div className="p-4 border-t border-border">
          {sidebarOpen ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  {user?.name?.[0].toUpperCase() || 'C'}
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="text-xs font-bold truncate leading-none">{user?.name || 'Candidate'}</h4>
                  <span className="text-[10px] text-muted-foreground truncate block mt-0.5">{user?.email || 'free@account.com'}</span>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={logout}
              className="w-full h-11 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Top Navbar & Workspace container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-md z-20">
          
          {/* Mobile sidebar trigger & Brand icon */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-muted text-muted-foreground md:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-bold text-lg hidden md:block capitalize">
              {activeView === 'upload' && 'Upload Resume'}
              {activeView === 'analysis' && 'Extracted RAG Summary'}
              {activeView === 'setup' && 'Configure Interview'}
              {activeView === 'chat' && 'Live Evaluation Workspace'}
              {activeView === 'completion' && 'Performance Scorecard'}
              {activeView === 'reports' && 'Reports Log'}
              {activeView === 'settings' && 'System Settings'}
              {activeView === 'dashboard' && `Welcome Back, ${user?.name || 'Candidate'}!`}
            </h2>
          </div>

          {/* Quick Actions (Notifications, Theme, Profile Dropdown) */}
          <div className="flex items-center space-x-3 relative">
            
            {/* Theme switcher */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-muted border border-border transition-colors text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="p-2 rounded-xl hover:bg-muted border border-border transition-colors text-muted-foreground hover:text-foreground relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 glass border border-border rounded-2xl shadow-xl py-4 z-40 overflow-hidden"
                  >
                    <div className="px-4 pb-2 border-b border-border flex justify-between items-center">
                      <span className="font-bold text-xs">Notifications</span>
                      {unreadNotifCount > 0 && (
                        <button 
                          onClick={markNotificationsRead}
                          className="text-[10px] text-indigo-500 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto pt-2">
                      {notifications.length === 0 ? (
                        <p className="text-center text-xs text-muted-foreground py-6">No notifications</p>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`px-4 py-2.5 text-xs border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors flex items-start space-x-2.5 ${
                              !notif.read ? 'bg-indigo-500/5 font-semibold text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${!notif.read ? 'text-indigo-500' : 'text-muted-foreground/50'}`} />
                            <span>{notif.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center space-x-2 p-1.5 border border-border rounded-xl hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  {user?.name?.[0].toUpperCase() || 'C'}
                </div>
                <span className="text-xs font-semibold max-w-[80px] truncate hidden sm:inline-block">
                  {user?.name || 'Candidate'}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 glass border border-border rounded-xl shadow-xl py-2 z-40"
                  >
                    <button 
                      onClick={() => { setProfileOpen(false); setActiveView('settings'); }}
                      className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-muted flex items-center space-x-2 text-foreground"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Profile Settings</span>
                    </button>
                    <button 
                      onClick={() => { setProfileOpen(false); setActiveView('settings'); }}
                      className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-muted flex items-center space-x-2 text-foreground"
                    >
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span>Billing & Plans</span>
                    </button>
                    <div className="border-t border-border my-1" />
                    <button 
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-red-500/10 text-red-500 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Main content body workspace */}
        <main className="flex-1 p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Nav Slide Drawer Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0.15 }}
              className="fixed inset-y-0 left-0 w-64 glass z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                    <Play className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-sm tracking-tight">InterviewRAG</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5">
                {navItems.filter(item => !item.hide).map((item) => {
                  const isActive = activeView === item.id || 
                                  (item.id === 'upload' && activeView === 'analysis') || 
                                  (item.id === 'setup' && activeView === 'completion');
                  const isDisabled = item.id === 'setup' && !uploadedResume;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full h-11 flex items-center rounded-xl px-4 text-sm font-semibold transition-all relative ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : isDisabled 
                            ? 'text-muted-foreground/30 cursor-not-allowed'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="absolute right-4 top-3 px-2 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/25">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                    {user?.name?.[0].toUpperCase() || 'C'}
                  </div>
                  <div className="text-left overflow-hidden">
                    <h4 className="text-xs font-bold truncate leading-none">{user?.name || 'Candidate'}</h4>
                    <span className="text-[9px] text-muted-foreground truncate block mt-0.5">{user?.email}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
