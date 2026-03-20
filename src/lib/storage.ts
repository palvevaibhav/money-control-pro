import { Goal, Lending, Notification, Transaction, UserStats } from '../types';
import { auth } from './firebase';
import { appendIntegrityEvent, clearSecurityArtifactsForCurrentUser } from './security';

const STORAGE_KEYS = {
  TRANSACTIONS: 'mcp_transactions',
  GOALS: 'mcp_goals',
  LENDING: 'mcp_lending',
  STATS: 'mcp_stats',
  SETTINGS: 'mcp_settings',
  NOTIFICATIONS: 'mcp_notifications',
  SECURITY_PREFERENCES: 'mcp_security_preferences',
} as const;

const STORAGE_SYNC_EVENT = 'mcp:storage-sync';
const TRACKED_USER_KEYS = new Set<string>([
  STORAGE_KEYS.TRANSACTIONS,
  STORAGE_KEYS.GOALS,
  STORAGE_KEYS.LENDING,
  STORAGE_KEYS.STATS,
  STORAGE_KEYS.NOTIFICATIONS,
]);

export interface AppSettings {
  currency: 'USD' | 'INR' | 'DUAL';
}

export interface SecurityPreferences {
  biometricLockEnabled: boolean;
  pinLockEnabled: boolean;
  encryptionEnabled: boolean;
  integrityShieldEnabled: boolean;
  publicKeyFingerprint?: string;
  keyPairCreatedAt?: string;
  lastSealAt?: string;
  lastIntegrityCheckAt?: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'DUAL',
};

const DEFAULT_SECURITY_PREFERENCES: SecurityPreferences = {
  biometricLockEnabled: false,
  pinLockEnabled: false,
  encryptionEnabled: false,
  integrityShieldEnabled: false,
};

const DEFAULT_STATS: UserStats = {
  level: 0,
  xp: 0,
  nextLevelXp: 1000,
  streak: 0,
  healthScore: 0,
  dnaInsights: [
    'Your financial DNA is currently a blank slate. Start tracking to generate insights.',
    'System ready for architectural configuration.',
  ],
  netWealth: 0,
  monthlyChange: 0,
  liquidAssets: 0,
  stakedInvested: 0,
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;

  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Invalid localStorage payload for ${key}. Resetting to fallback.`, error);
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function emitStorageSync() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT));
}

function getCurrentUid() {
  return auth.currentUser?.uid;
}

function trackIntegrityIfNeeded(key: string) {
  if (!TRACKED_USER_KEYS.has(key)) return;
  if (!storage.getSecurityPreferences().integrityShieldEnabled) return;

  queueMicrotask(() => {
    void appendIntegrityEvent(key);
  });
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  trackIntegrityIfNeeded(key);
  emitStorageSync();
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export function subscribeToStorageSync(callback: () => void) {
  if (!isBrowser()) return () => undefined;

  window.addEventListener(STORAGE_SYNC_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(STORAGE_SYNC_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function createEntityId(prefix: string) {
  return createId(prefix);
}

export const storage = {
  getSettings: (): AppSettings => readJson(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
  saveSettings: (settings: AppSettings) => {
    writeJson(STORAGE_KEYS.SETTINGS, settings);
  },

  getSecurityPreferences: (): SecurityPreferences =>
    readJson(STORAGE_KEYS.SECURITY_PREFERENCES, DEFAULT_SECURITY_PREFERENCES),
  saveSecurityPreferences: (preferences: SecurityPreferences) => {
    writeJson(STORAGE_KEYS.SECURITY_PREFERENCES, preferences);
  },

  getTransactions: (): Transaction[] => {
    const uid = getCurrentUid();
    const list = readJson<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    return uid ? list.filter((transaction) => transaction.uid === uid) : [];
  },
  saveTransaction: (transaction: Transaction) => {
    const list = readJson<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    writeJson(STORAGE_KEYS.TRANSACTIONS, [transaction, ...list]);
  },
  deleteTransaction: (id: string) => {
    const list = readJson<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    writeJson(
      STORAGE_KEYS.TRANSACTIONS,
      list.filter((transaction) => transaction.id !== id),
    );
  },

  getGoals: (): Goal[] => {
    const uid = getCurrentUid();
    const list = readJson<Goal[]>(STORAGE_KEYS.GOALS, []);
    return uid ? list.filter((goal) => goal.uid === uid) : [];
  },
  saveGoal: (goal: Goal) => {
    const list = readJson<Goal[]>(STORAGE_KEYS.GOALS, []);
    writeJson(STORAGE_KEYS.GOALS, [...list, goal]);
  },
  updateGoal: (id: string, amount: number) => {
    const list = readJson<Goal[]>(STORAGE_KEYS.GOALS, []);
    writeJson(
      STORAGE_KEYS.GOALS,
      list.map((goal) =>
        goal.id === id
          ? { ...goal, currentAmount: Math.min(goal.targetAmount, goal.currentAmount + amount) }
          : goal,
      ),
    );
  },
  deleteGoal: (id: string) => {
    const list = readJson<Goal[]>(STORAGE_KEYS.GOALS, []);
    writeJson(
      STORAGE_KEYS.GOALS,
      list.filter((goal) => goal.id !== id),
    );
  },

  getLending: (): Lending[] => {
    const uid = getCurrentUid();
    const list = readJson<Lending[]>(STORAGE_KEYS.LENDING, []);
    return uid ? list.filter((entry) => entry.uid === uid) : [];
  },
  saveLending: (entry: Lending) => {
    const list = readJson<Lending[]>(STORAGE_KEYS.LENDING, []);
    writeJson(STORAGE_KEYS.LENDING, [entry, ...list]);
  },
  deleteLending: (id: string) => {
    const list = readJson<Lending[]>(STORAGE_KEYS.LENDING, []);
    writeJson(
      STORAGE_KEYS.LENDING,
      list.filter((entry) => entry.id !== id),
    );
  },

  getStats: (): UserStats => {
    const statsMap = readJson<Record<string, UserStats>>(STORAGE_KEYS.STATS, {});
    const uid = getCurrentUid();

    if (uid && statsMap[uid]) {
      return statsMap[uid];
    }

    return DEFAULT_STATS;
  },
  saveStats: (stats: UserStats) => {
    const uid = getCurrentUid();
    if (!uid) return;

    const statsMap = readJson<Record<string, UserStats>>(STORAGE_KEYS.STATS, {});
    writeJson(STORAGE_KEYS.STATS, {
      ...statsMap,
      [uid]: stats,
    });
  },

  getNotifications: (): Notification[] => {
    const uid = getCurrentUid();
    const list = readJson<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return uid ? list.filter((notification) => notification.uid === uid) : [];
  },
  saveNotification: (notification: Notification) => {
    const list = readJson<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    writeJson(STORAGE_KEYS.NOTIFICATIONS, [notification, ...list]);
  },
  markNotificationAsRead: (id: string) => {
    const list = readJson<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    writeJson(
      STORAGE_KEYS.NOTIFICATIONS,
      list.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  },
  markAllNotificationsAsRead: () => {
    const list = readJson<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    writeJson(
      STORAGE_KEYS.NOTIFICATIONS,
      list.map((notification) => ({ ...notification, read: true })),
    );
  },
  deleteNotification: (id: string) => {
    const list = readJson<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    writeJson(
      STORAGE_KEYS.NOTIFICATIONS,
      list.filter((notification) => notification.id !== id),
    );
  },
  clearNotificationsForCurrentUser: () => {
    const uid = getCurrentUid();
    if (!uid) return;

    const list = readJson<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    writeJson(
      STORAGE_KEYS.NOTIFICATIONS,
      list.filter((notification) => notification.uid !== uid),
    );
  },

  clearUserData: () => {
    const uid = getCurrentUid();
    if (!uid || !isBrowser()) return;

    const transactions = readJson<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    writeJson(
      STORAGE_KEYS.TRANSACTIONS,
      transactions.filter((transaction) => transaction.uid !== uid),
    );

    const goals = readJson<Goal[]>(STORAGE_KEYS.GOALS, []);
    writeJson(
      STORAGE_KEYS.GOALS,
      goals.filter((goal) => goal.uid !== uid),
    );

    const lending = readJson<Lending[]>(STORAGE_KEYS.LENDING, []);
    writeJson(
      STORAGE_KEYS.LENDING,
      lending.filter((entry) => entry.uid !== uid),
    );

    const notifications = readJson<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    writeJson(
      STORAGE_KEYS.NOTIFICATIONS,
      notifications.filter((notification) => notification.uid !== uid),
    );

    const statsMap = readJson<Record<string, UserStats>>(STORAGE_KEYS.STATS, {});
    delete statsMap[uid];
    writeJson(STORAGE_KEYS.STATS, statsMap);

    window.localStorage.removeItem(STORAGE_KEYS.SECURITY_PREFERENCES);
    queueMicrotask(() => {
      void clearSecurityArtifactsForCurrentUser(uid);
    });
  },
  clearAllData: () => {
    if (!isBrowser()) return;
    window.localStorage.clear();
    emitStorageSync();
  },
};
