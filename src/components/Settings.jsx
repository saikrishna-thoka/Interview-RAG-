import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Shield, Key, Bell, CreditCard, 
  Eye, EyeOff, Save, Check, RefreshCw, Sparkles 
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Settings() {
  const { 
    user, theme, setTheme, activeSubscription, 
    notifications, markNotificationsRead 
  } = useAppStore();

  const [name, setName] = useState(user?.name || 'Alex Mercer');
  const [email, setEmail] = useState(user?.email || 'alex.mercer@gmail.com');
  const [visibleKey, setVisibleKey] = useState(false);
  const [tempKey, setTempKey] = useState(groqKey);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Preference switches states
  const [notifSound, setNotifSound] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifTips, setNotifTips] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setSaveSuccess('Profile successfully updated!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleKeySave = (e) => {
    e.preventDefault();
    setGroqKey(tempKey);
    setSaveSuccess('Groq API Key saved successfully!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Preferences', icon: <Bell className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing & Plan', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 pb-16">
      
      {/* Toast Notification Banner */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-green-900 border border-green-500/30 text-green-200 text-xs shadow-2xl flex items-center space-x-2.5">
          <Check className="w-4 h-4 text-green-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">System Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure your user details, preferences, and manage your SaaS subscription details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Side: Tabs Navigation (1 col) */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Configuration Views (3 cols) */}
        <div className="md:col-span-3">
          
          {/* Tab 1: Profile Settings */}
          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-6 border border-border space-y-6 shadow-md"
            >
              <div className="border-b border-border/60 pb-3">
                <h3 className="font-extrabold text-base">User Profile</h3>
                <p className="text-xs text-muted-foreground">Update your resume candidate name and email credentials.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Candidate Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3.5 bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Contact Email</label>
                    <input 
                      type="email" 
                      value={email} 
                      disabled
                      className="w-full h-10 px-3.5 bg-muted/20 border border-border rounded-xl text-xs opacity-60 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    className="px-5 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Tab 3: Themes & Preferences */}
          {activeTab === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-6 border border-border space-y-6 shadow-md"
            >
              <div className="border-b border-border/60 pb-3">
                <h3 className="font-extrabold text-base">UI & Notification Preferences</h3>
                <p className="text-xs text-muted-foreground">Adjust display modes and notification setups.</p>
              </div>

              <div className="space-y-6">
                
                {/* Theme toggle segment */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Interface Color Theme</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`h-11 text-xs font-bold rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                        theme === 'light' 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                          : 'border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <span>Light Theme</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`h-11 text-xs font-bold rounded-xl border flex items-center justify-center space-x-2 transition-all ${
                        theme === 'dark' 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                          : 'border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <span>Dark Theme</span>
                    </button>
                  </div>
                </div>

                {/* Checklist options */}
                <div className="space-y-3 pt-2 border-t border-border/60">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Alert Preferences</h4>
                  
                  <div className="space-y-2.5">
                    <label className="flex items-center space-x-3 cursor-pointer text-xs font-medium">
                      <input 
                        type="checkbox" 
                        checked={notifSound}
                        onChange={(e) => setNotifSound(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <span>Enable sound clicks during chat progression</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer text-xs font-medium">
                      <input 
                        type="checkbox" 
                        checked={notifEmail}
                        onChange={(e) => setNotifEmail(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <span>Send weekly reports digests via email</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer text-xs font-medium">
                      <input 
                        type="checkbox" 
                        checked={notifTips}
                        onChange={(e) => setNotifTips(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <span>Get occasional career coaching and LLM mock tips</span>
                    </label>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Tab 4: Billing Plans */}
          {activeTab === 'billing' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-6 border border-border space-y-6 shadow-md"
            >
              <div className="border-b border-border/60 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-base">Subscription Plan</h3>
                  <p className="text-xs text-muted-foreground">Manage your SaaS pricing subscriptions, limits, and plans.</p>
                </div>
                
                <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                  Active tier: {activeSubscription?.plan_name || 'Free Starter'}
                </span>
              </div>

              {/* Display Current Limits */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 border border-border rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Resume Upload Limit</span>
                  <p className="text-sm font-bold text-foreground">
                    {activeSubscription?.limits?.resumes === 100 ? 'Unlimited (100)' : `${activeSubscription?.limits?.resumes || 1} Resume`}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interview Questions Limit</span>
                  <p className="text-sm font-bold text-foreground">
                    {activeSubscription?.limits?.questions || 10} Questions / Session
                  </p>
                </div>
              </div>

              {/* Upgrade or Plan confirmation card */}
              {(activeSubscription?.plan_name || 'Free Starter').includes('Free') ? (
                <div className="p-6 bg-gradient-to-tr from-indigo-950/20 to-purple-950/20 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex items-center space-x-2 text-indigo-400">
                      <Sparkles className="w-4 h-4 animate-bounce" />
                      <h4 className="font-extrabold text-sm">Upgrade to Pro Developer</h4>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Unlock expanded resume uploads, unlimited interview mock runs, 20 questions per session, and full PDF analytics exports.
                    </p>
                  </div>

                  <div className="text-center sm:text-right relative z-10 flex-shrink-0">
                    <div className="flex items-baseline justify-center sm:justify-end mb-3">
                      <span className="text-3xl font-black font-mono text-white">$19</span>
                      <span className="text-muted-foreground text-[10px] ml-1.5">/ month</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => alert('SSO checkout initiated. Thank you!')}
                      className="px-4 h-9 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <Check className="w-4 h-4" />
                      <h4 className="font-extrabold text-sm">Active Pro Plan Features Enabled</h4>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      You have unlocked maximum questions (20) per interview and a large resume parsing allowance. Expiration: {activeSubscription?.expires_at ? new Date(activeSubscription.expires_at).toLocaleDateString() : 'N/A'}.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    Paid Account Active
                  </span>
                </div>
              )}
            </motion.div>
          )}

        </div>

      </div>

    </div>
  );
}
