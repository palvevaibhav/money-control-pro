import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Battery, Signal, Wifi } from 'lucide-react';
import { auth, firebaseApp, getRedirectResult, onAuthStateChanged } from './lib/firebase';
import { storage, subscribeToStorageSync } from './lib/storage';
import type { SecurityPreferences } from './lib/storage';
import { initializeGateway } from './api/client';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NotificationSystem } from './components/NotificationSystem';
import { SplashScreen } from './components/SplashScreen';
import { Dashboard } from './components/Dashboard';
import { ExpensesPage } from './components/ExpensesPage';
import { AIDNAPage } from './components/AIDNAPage';
import { SovereignAIChat } from './components/SovereignAIChat';
import { VaultPage } from './components/VaultPage';
import { ProfilePage } from './components/ProfilePage';
import { NotificationsPage } from './components/NotificationsPage';

const PageSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
  </div>
);

const StatusBar = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-6 px-6 flex justify-between items-center text-[10px] font-bold z-[60] bg-surface/80 backdrop-blur-sm safe-top">
      <span className="text-on-surface">{time}</span>
      <div className="flex items-center gap-1.5 text-on-surface">
        <Signal className="w-3 h-3" />
        <Wifi className="w-3 h-3" />
        <Battery className="w-3 h-3 rotate-90" />
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityPreferences, setSecurityPreferences] = useState<SecurityPreferences>(
    storage.getSecurityPreferences(),
  );

  // Toggle login/signup
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    initializeGateway(firebaseApp);
  }, []);

  // Track Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) setUser(result.user);
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };
    void checkRedirect();
  }, []);

  useEffect(() => {
    const syncSecurityPreferences = () => setSecurityPreferences(storage.getSecurityPreferences());
    syncSecurityPreferences();
    return subscribeToStorageSync(syncSecurityPreferences);
  }, []);

  const page = useMemo(() => {
    if (!user) {
      // Show Login or Signup page
      return showSignup ? (
        <SignupPage onSignupSwitch={() => setShowSignup(false)} />
      ) : (
        <LoginPage onSignupSwitch={() => setShowSignup(true)} />
      );
    }

    // User is logged in → show dashboard/tab pages
    switch (activeTab) {
      case 'home':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'expenses':
        return <ExpensesPage />;
      case 'aidna':
        return <AIDNAPage setActiveTab={setActiveTab} />;
      case 'chat':
        return <SovereignAIChat />;
      case 'vault':
        return <VaultPage />;
      case 'profile':
        return <ProfilePage />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  }, [activeTab, user, showSignup]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="app-container">
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>

      {user && <StatusBar />}
      <Header setActiveTab={setActiveTab} />
      <NotificationSystem />

      <div className="scroll-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={user ? activeTab : showSignup ? 'signup' : 'login'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="px-6 py-4"
          >
            <Suspense fallback={<PageSkeleton />}>{page}</Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      {user && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
}
