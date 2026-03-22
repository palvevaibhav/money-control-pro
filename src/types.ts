export interface Transaction {
  id: string;
  uid: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  type: 'expense' | 'income';
}

export interface Goal {
  id: string;
  uid: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
}

export interface Lending {
  id: string;
  uid: string;
  person: string;
  amount: number;
  type: 'lent' | 'borrowed';
  date: string;
  interestRate: number;
  dueDate: string;
}

export interface UserStats {
  level: number;
  xp: number;
  nextLevelXp: number;
  streak: number;
  healthScore: number;
  dnaInsights: string[];
  netWealth: number;
  monthlyChange: number;
  liquidAssets: number;
  stakedInvested: number;
}

export interface Notification {
  id: string;
  uid: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SecurityPreferences {
  biometricLockEnabled: boolean;
  encryptionEnabled?: boolean;
  integrityShieldEnabled?: boolean;
  publicKeyFingerprint?: string;
  keyPairCreatedAt?: string;
  lastSealAt?: string;
  lastIntegrityCheckAt?: string;
}
