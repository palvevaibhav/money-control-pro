import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { storage, subscribeToStorageSync } from '../lib/storage';

interface HeaderProps {
  setActiveTab: (tab: string) => void;
}

export const Header = ({ setActiveTab }: HeaderProps) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const syncUnreadCount = () => {
      const notifications = storage.getNotifications();
      setUnreadCount(notifications.filter((notification) => !notification.read).length);
    };

    syncUnreadCount();
    return subscribeToStorageSync(syncUnreadCount);
  }, []);

  return (
    <header className="fixed top-0 w-full flex justify-between items-center px-6 h-20 bg-surface/80 backdrop-blur-xl z-50 pt-6 safe-top">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveTab('profile')} className="relative w-10 h-10 active:scale-95 transition-transform">
          <img
            alt="User Profile"
            className="w-full h-full rounded-full object-cover border-2 border-primary/20"
            src="https://picsum.photos/seed/finance/100/100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-[7px] font-black px-1 py-0.5 rounded-full ring-2 ring-surface uppercase tracking-tighter">
            LVL 24
          </div>
        </button>
        <span className="text-xl font-black tracking-tighter text-primary">Money Control Pro</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setActiveTab('notifications')} className="text-primary hover:bg-white/5 transition-colors p-2 rounded-xl relative">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-surface"></div>}
        </button>
      </div>
    </header>
  );
};
