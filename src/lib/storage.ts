import { Transaction, Goal, Lending, UserStats, Notification } from '../types';
import { auth } from './firebase';

const STORAGE_KEYS = {
  TRANSACTIONS: 'mcp_transactions',
  GOALS: 'mcp_goals',
  LENDING: 'mcp_lending',
  STATS: 'mcp_stats',
  SETTINGS: 'mcp_settings',
  NOTIFICATIONS: 'mcp_notifications',
};

export interface AppSettings {
  currency: 'USD' | 'INR' | 'DUAL';
}

export const storage = {
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { currency: 'DUAL' };
  },
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const list: Transaction[] = data ? JSON.parse(data) : [];
    return list.filter(t => t.uid === auth.currentUser?.uid);
  },
  saveTransaction: (t: Transaction) => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const list = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([t, ...list]));
  },
  deleteTransaction: (id: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const list: Transaction[] = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list.filter(t => t.id !== id)));
  },
  
  getGoals: (): Goal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    const list: Goal[] = data ? JSON.parse(data) : [];
    return list.filter(g => g.uid === auth.currentUser?.uid);
  },
  saveGoal: (g: Goal) => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    const list = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([...list, g]));
  },
  updateGoal: (id: string, amount: number) => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    const list: Goal[] = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g)));
  },
  deleteGoal: (id: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    const list: Goal[] = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list.filter(g => g.id !== id)));
  },

  getLending: (): Lending[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LENDING);
    const list: Lending[] = data ? JSON.parse(data) : [];
    return list.filter(l => l.uid === auth.currentUser?.uid);
  },
  saveLending: (l: Lending) => {
    const data = localStorage.getItem(STORAGE_KEYS.LENDING);
    const list = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.LENDING, JSON.stringify([l, ...list]));
  },
  deleteLending: (id: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.LENDING);
    const list: Lending[] = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.LENDING, JSON.stringify(list.filter(l => l.id !== id)));
  },

  getStats: (): UserStats => {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    const statsMap: Record<string, UserStats> = data ? JSON.parse(data) : {};
    const uid = auth.currentUser?.uid;
    
    if (uid && statsMap[uid]) {
      return statsMap[uid];
    }

    return {
      level: 0,
      xp: 0,
      nextLevelXp: 1000,
      streak: 0,
      healthScore: 0,
      dnaInsights: [
        "Your financial DNA is currently a blank slate. Start tracking to generate insights.",
        "System ready for architectural configuration."
      ],
      netWealth: 0,
      monthlyChange: 0,
      liquidAssets: 0,
      stakedInvested: 0
    };
  },
  saveStats: (stats: UserStats) => {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    const statsMap: Record<string, UserStats> = data ? JSON.parse(data) : {};
    const uid = auth.currentUser?.uid;
    if (uid) {
      statsMap[uid] = stats;
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(statsMap));
    }
  },
  getNotifications: (): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: Notification[] = data ? JSON.parse(data) : [];
    return list.filter(n => n.uid === auth.currentUser?.uid);
  },
  saveNotification: (n: Notification) => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([n, ...list]));
  },
  markNotificationAsRead: (id: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: Notification[] = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list.map(n => n.id === id ? { ...n, read: true } : n)));
  },
  markAllNotificationsAsRead: () => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: Notification[] = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list.map(n => ({ ...n, read: true }))));
  },
  deleteNotification: (id: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: Notification[] = data ? JSON.parse(data) : [];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list.filter(n => n.id !== id)));
  },
  clearUserData: () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (transactions) {
      const list: Transaction[] = JSON.parse(transactions);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list.filter(t => t.uid !== uid)));
    }

    const goals = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (goals) {
      const list: Goal[] = JSON.parse(goals);
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(list.filter(g => g.uid !== uid)));
    }

    const lending = localStorage.getItem(STORAGE_KEYS.LENDING);
    if (lending) {
      const list: Lending[] = JSON.parse(lending);
      localStorage.setItem(STORAGE_KEYS.LENDING, JSON.stringify(list.filter(l => l.uid !== uid)));
    }

    const notifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (notifications) {
      const list: Notification[] = JSON.parse(notifications);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list.filter(n => n.uid !== uid)));
    }

    const stats = localStorage.getItem(STORAGE_KEYS.STATS);
    if (stats) {
      const statsMap: Record<string, UserStats> = JSON.parse(stats);
      delete statsMap[uid];
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(statsMap));
    }

    window.location.reload();
  },
  clearAllData: () => {
    localStorage.clear();
    window.location.reload();
  }
};
