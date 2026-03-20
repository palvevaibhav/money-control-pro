import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from './lib/firebase';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { ExpensesPage } from './components/ExpensesPage';
import { AIDNAPage } from './components/AIDNAPage';
import { SovereignAIChat } from './components/SovereignAIChat';
import { VaultPage } from './components/VaultPage';
import { ProfilePage } from './components/ProfilePage';
import { NotificationsPage } from './components/NotificationsPage';
import { NotificationSystem } from './components/NotificationSystem';
import { SplashScreen } from './components/SplashScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, Signal, Battery } from 'lucide-react';

const StatusBar = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
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

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <Dashboard setActiveTab={setActiveTab} />;
      case 'expenses': return <ExpensesPage />;
      case 'aidna': return <AIDNAPage setActiveTab={setActiveTab} />;
      case 'chat': return <SovereignAIChat />;
      case 'vault': return <VaultPage />;
      case 'profile': return <ProfilePage />;
      case 'notifications': return <NotificationsPage />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>

      <StatusBar />
      <Header setActiveTab={setActiveTab} />
      <NotificationSystem />
      
      <div className="scroll-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="px-6 py-4"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
