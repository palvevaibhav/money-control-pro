import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Battery, Signal, Wifi } from 'lucide-react';
import { auth, onAuthStateChanged } from './lib/firebase';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NotificationSystem } from './components/NotificationSystem';
import { SplashScreen } from './components/SplashScreen';
import { AppLockGate } from './components/AppLockGate';
import { SecurityPreferences, storage, subscribeToStorageSync } from './lib/storage';

const Dashboard = lazy(() =>
  import('./components/Dashboard').then((module) => ({ default: module.Dashboard })),
);
const ExpensesPage = lazy(() =>
  import('./components/ExpensesPage').then((module) => ({ default: module.ExpensesPage })),
);
const AIDNAPage = lazy(() =>
  import('./components/AIDNAPage').then((module) => ({ default: module.AIDNAPage })),
);
const SovereignAIChat = lazy(() =>
  import('./components/SovereignAIChat').then((module) => ({ default: module.SovereignAIChat })),
);
const VaultPage = lazy(() =>
  import('./components/VaultPage').then((module) => ({ default: module.VaultPage })),
);
const ProfilePage = lazy(() =>
  import('./components/ProfilePage').then((module) => ({ default: module.ProfilePage })),
);
const NotificationsPage = lazy(() =>
  import('./components/NotificationsPage').then((module) => ({ default: module.NotificationsPage })),
);

const PageSkeleton = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const syncSecurityPreferences = () => {
      setSecurityPreferences(storage.getSecurityPreferences());
    };

    syncSecurityPreferences();
    return subscribeToStorageSync(syncSecurityPreferences);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <AnimatePresence>
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        </AnimatePresence>
        {!showSplash && <LoginPage />}
      </div>
    );
  }

  const page = useMemo(() => {
    switch (activeTab) {
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
      case 'home':
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  }, [activeTab]);

  return (
    <div className="app-container">
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>

      <StatusBar />
      <Header setActiveTab={setActiveTab} />
      <NotificationSystem />
      <AppLockGate enabled={Boolean(user && securityPreferences.biometricLockEnabled)} />

      <div className="scroll-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
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

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
