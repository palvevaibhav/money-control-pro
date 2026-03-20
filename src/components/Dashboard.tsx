import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Brain,
  ChevronRight,
  Dna,
  Eye,
  EyeOff,
  Plus,
  Scan,
  ShoppingCart,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CameraModal } from './CameraModal';
import { formatDualCurrency } from '../lib/currency';
import { storage, subscribeToStorageSync } from '../lib/storage';
import { Transaction, UserStats } from '../types';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard = ({ setActiveTab }: DashboardProps) => {
  const [showWealth, setShowWealth] = useState(true);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(() => storage.getTransactions());
  const [stats, setStats] = useState<UserStats>(() => storage.getStats());

  useEffect(() => {
    const syncDashboard = () => {
      setTransactions(storage.getTransactions());
      setStats(storage.getStats());
    };

    syncDashboard();
    return subscribeToStorageSync(syncDashboard);
  }, []);

  const recentActivity =
    transactions.length > 0
      ? transactions
          .map((transaction) => ({
            id: transaction.id,
            title: transaction.description,
            category: transaction.category,
            time: new Date(transaction.date).toLocaleDateString(),
            amount: transaction.type === 'expense' ? -transaction.amount : transaction.amount,
            xp: transaction.type === 'income' ? 50 : 5,
            icon: transaction.type === 'income' ? Zap : ShoppingCart,
            color:
              transaction.type === 'income'
                ? 'bg-emerald-500/20 text-emerald-500'
                : 'bg-orange-500/20 text-orange-500',
          }))
          .slice(0, 5)
      : [];

  const progress = stats.nextLevelXp > 0 ? Math.round((stats.xp / stats.nextLevelXp) * 100) : 0;

  return (
    <div className="space-y-6 pb-24">
      <section className="bg-surface-container/40 p-4 rounded-2xl border border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/60">
            Wealth Architect LVL {stats.level}
          </span>
          <span className="text-[10px] font-black text-primary">{progress}% to Lvl {stats.level + 1}</span>
        </div>
        <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            className="h-full bg-primary shadow-[0_0_10px_rgba(68,243,169,0.5)]"
          />
        </div>
      </section>

      <section className="bg-surface-container/40 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface/60 mb-1">DNA Health</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-primary">{stats.healthScore}</span>
            <span className="text-sm font-bold text-on-surface/40">/200</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <Dna className="w-6 h-6 text-primary" />
        </div>
      </section>

      <section className="bg-surface-container p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface/60">Net Sovereign Wealth</span>
            <button onClick={() => setShowWealth(!showWealth)} className="text-on-surface/40 hover:text-primary transition-colors">
              {showWealth ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">
              {showWealth ? formatDualCurrency(stats.netWealth).main : '••••••••'}
            </h2>
            {showWealth && formatDualCurrency(stats.netWealth).sub && (
              <p className="text-[10px] font-bold text-on-surface/40">{formatDualCurrency(stats.netWealth).sub}</p>
            )}
          </div>
          <div className="flex items-center text-primary font-bold text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>{stats.monthlyChange}%</span>
            <span className="text-[10px] ml-1 opacity-60">this month</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-4 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface/40 mb-1">Liquid Assets</p>
            <p className="text-base font-black">{showWealth ? formatDualCurrency(stats.liquidAssets).main : '••••••'}</p>
            {showWealth && formatDualCurrency(stats.liquidAssets).sub && (
              <p className="text-[8px] font-bold text-on-surface/40">{formatDualCurrency(stats.liquidAssets).sub}</p>
            )}
          </div>
          <div className="bg-surface-container-low p-4 rounded-2xl border border-white/5">
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface/40 mb-1">Staked/Invested</p>
            <p className="text-base font-black text-primary">{showWealth ? formatDualCurrency(stats.stakedInvested).main : '••••••'}</p>
            {showWealth && formatDualCurrency(stats.stakedInvested).sub && (
              <p className="text-[8px] font-bold text-on-surface/40">{formatDualCurrency(stats.stakedInvested).sub}</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('expenses')}
          className="bg-surface-container/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3 group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-center">Add Expense</span>
        </button>
        <button
          onClick={() => setIsCameraOpen(true)}
          className="bg-surface-container/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3 group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
            <Scan className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-center">Scan Receipt</span>
        </button>

        <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onSuccess={() => setIsCameraOpen(false)} />
        <button
          onClick={() => setActiveTab('aidna')}
          className="bg-primary p-4 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-[0_10px_20px_rgba(68,243,169,0.2)] active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-black text-center">Talk to AI</span>
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xl font-black tracking-tight">Recent Activity</h3>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 inline-flex items-center gap-1"
          >
            View Ledger
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="bg-surface-container/40 p-6 rounded-2xl border border-white/5 text-sm text-on-surface/70">
              Start by adding an income or expense to populate your live activity feed.
            </div>
          ) : (
            recentActivity.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-surface-container/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">{item.title}</h4>
                    <p className="text-[10px] text-on-surface/40 font-bold uppercase tracking-wider">
                      {item.category} • {item.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black tracking-tighter text-sm ${item.amount > 0 ? 'text-primary' : 'text-on-surface'}`}>
                    {item.amount > 0 ? '+' : ''}
                    {formatDualCurrency(Math.abs(item.amount)).main}
                  </p>
                  {formatDualCurrency(Math.abs(item.amount)).sub && (
                    <p className="text-[8px] font-bold text-on-surface/40">
                      {item.amount > 0 ? '+' : ''}
                      {formatDualCurrency(Math.abs(item.amount)).sub}
                    </p>
                  )}
                  <p className="text-[9px] font-black text-primary uppercase">+{item.xp} XP</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-surface-container/40 p-6 rounded-2xl border-l-4 border-primary relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-1.5"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-primary">Live Analysis</span>
          </motion.div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">AI Recommendation</h4>
            <p className="text-sm font-medium leading-relaxed text-on-surface/80">
              Move {formatDualCurrency(1200).main}{' '}
              {formatDualCurrency(1200).sub ? `(${formatDualCurrency(1200).sub})` : ''} from Checking to Vault Alpha. Interest delta:{' '}
              <span className="text-primary">+{formatDualCurrency(4.5).main}/mo</span>. Impact:{' '}
              <span className="text-primary">+2 DNA Score points</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
