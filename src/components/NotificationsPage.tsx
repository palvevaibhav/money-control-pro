import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Info, AlertTriangle, Trash2, X, Check } from 'lucide-react';
import { storage } from '../lib/storage';
import { Notification } from '../types';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(storage.getNotifications());
  }, []);

  const markAsRead = (id: string) => {
    storage.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    storage.markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    storage.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    const data = localStorage.getItem('mcp_notifications');
    const list: Notification[] = data ? JSON.parse(data) : [];
    const otherUsersNotifications = list.filter(n => n.uid !== auth.currentUser?.uid);
    localStorage.setItem('mcp_notifications', JSON.stringify(otherUsersNotifications));
    setNotifications([]);
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface">Notifications</h1>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-1">
            System Insights & Alerts
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={markAllAsRead}
            className="p-3 bg-surface-container rounded-2xl text-primary hover:bg-primary/10 transition-colors"
            title="Mark all as read"
          >
            <Check className="w-5 h-5" />
          </button>
          <button 
            onClick={clearAll}
            className="p-3 bg-surface-container rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-surface-container p-12 rounded-[2.5rem] text-center space-y-4 border border-white/5">
            <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto">
              <Bell className="w-10 h-10 text-on-surface-variant/20" />
            </div>
            <div className="space-y-1">
              <p className="text-on-surface font-bold">All caught up!</p>
              <p className="text-xs text-on-surface-variant">No new notifications at the moment.</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => !n.read && markAsRead(n.id)}
                className={cn(
                  "bg-surface-container p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group",
                  n.read ? "border-white/5 opacity-60" : "border-primary/20 bg-primary/5 shadow-lg shadow-primary/5"
                )}
              >
                {!n.read && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}
                
                <div className="flex gap-4">
                  <div className={cn(
                    "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center",
                    n.type === 'info' ? "bg-primary/10 text-primary" :
                    n.type === 'warning' ? "bg-amber-500/10 text-amber-500" :
                    "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {n.type === 'info' && <Info className="w-6 h-6" />}
                    {n.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
                    {n.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-on-surface tracking-tight">{n.title}</h3>
                        <span className="text-[9px] font-black text-on-surface/30 uppercase tracking-widest whitespace-nowrap">
                          {n.timestamp}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => deleteNotification(e, n.id)}
                        className="p-2 text-on-surface-variant/20 hover:text-rose-500 transition-colors bg-surface-container-highest rounded-xl border border-outline-variant/10 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
