import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { Notification } from '../types';
import { auth } from '../lib/firebase';

export const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock adding a notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification('info', 'System Insight', 'AI Analysis: Your "Friday Spike" in spending is recurring. Consider a budget review.');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const addNotification = (type: Notification['type'], title: string, message: string) => {
    if (!auth.currentUser) return;
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      uid: auth.currentUser.uid,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    
    // Save to permanent storage
    storage.saveNotification(newNotification);
    
    // Add to temporary toast list
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => removeNotification(id), 6000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-20 right-6 z-[100] space-y-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="pointer-events-auto w-80 bg-surface-container/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex gap-4"
          >
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              n.type === 'info' ? 'bg-primary/20 text-primary' :
              n.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
              'bg-emerald-500/20 text-emerald-500'
            }`}>
              {n.type === 'info' && <Info className="w-5 h-5" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/40">
                  {n.title}
                </span>
                <button onClick={() => removeNotification(n.id)} className="text-on-surface/20 hover:text-on-surface transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-medium leading-relaxed text-on-surface/80">{n.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
