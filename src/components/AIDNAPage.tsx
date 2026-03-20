import React, { useState } from 'react';
import { Info, TrendingUp, ShieldCheck, Zap, Sword, Diamond, Landmark, Lock, Calendar, MessageSquare, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../lib/storage';
import { getFinancialAdvice } from '../lib/ai';
import { formatDualCurrency } from '../lib/currency';
import { cn } from '../lib/utils';

interface AIDNAPageProps {
  setActiveTab: (tab: string) => void;
}

export const AIDNAPage = ({ setActiveTab }: AIDNAPageProps) => {
  const stats = storage.getStats();
  const [query, setQuery] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const result = await getFinancialAdvice(query);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* ... Hero Section ... */}
      <section className="relative flex flex-col items-center justify-center py-10 overflow-hidden">
        <div className="absolute inset-0 dna-gradient pointer-events-none"></div>
        <div className="relative z-10 text-center space-y-4">
          <p className="text-on-surface-variant font-medium tracking-[0.2em] uppercase text-xs">Sovereign Identity</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface">Financial DNA</h1>
        </div>
        
        <div className="mt-12 relative flex items-center justify-center group">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-primary/20 orb-glow flex flex-col items-center justify-center bg-surface-container-low/40 backdrop-blur-3xl relative overflow-hidden transition-all duration-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
            <span className="text-on-surface-variant text-sm font-bold tracking-widest uppercase">Health Score</span>
            <div className="flex items-baseline">
              <span className="text-6xl md:text-7xl font-black tracking-tighter text-primary">{stats.healthScore}</span>
              <span className="text-xl font-bold text-on-surface-variant">/200</span>
            </div>
            <div className="mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-primary text-[10px] font-black uppercase tracking-tighter">Elite Architect Status</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Advisor Chat */}
      <section className="bg-gradient-to-br from-surface-container to-surface rounded-2xl p-8 border border-primary/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Sparkles className="text-primary w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-on-surface">AI Financial Advisor</h2>
          </div>
          <button 
            onClick={() => setActiveTab('chat')}
            className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-3 h-3" />
            Full Chat
          </button>
        </div>
        
        <form onSubmit={handleAskAI} className="relative">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your finances..."
            className="w-full bg-surface-container-lowest border-none rounded-xl pl-4 pr-12 py-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            {loading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
          </button>
        </form>

        <AnimatePresence>
          {advice && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30"
            >
              <div className="flex gap-3">
                <BrainCircuit className="text-primary w-5 h-5 shrink-0 mt-1" />
                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{advice}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* XP & Leveling Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface-container rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">Lvl {stats.level} Wealth Architect</h2>
                <p className="text-on-surface-variant text-sm mt-1">{stats.nextLevelXp - stats.xp} XP until Level {stats.level + 1} Master Overseer</p>
              </div>
              <ShieldCheck className="text-primary w-10 h-10" />
            </div>
            <div className="mt-8 space-y-2">
              <div className="h-3 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.xp / stats.nextLevelXp) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                ></motion.div>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                <span>{stats.xp.toLocaleString()} XP</span>
                <span>{stats.nextLevelXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-high rounded-xl p-8 border border-primary/5">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-amber-400 w-5 h-5 fill-amber-400" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">Active Streak</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-4xl font-black text-on-surface tracking-tighter">{stats.streak} Days</h3>
            <p className="text-on-surface-variant text-sm">Wealth Challenge Progress</p>
          </div>
          <div className="mt-6 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={cn("flex-1 h-1 rounded-full", i <= 3 ? "bg-primary" : "bg-surface-container-lowest")}></div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid: Insights & Badges */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-surface-container rounded-xl p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="text-primary w-5 h-5" />
            <h2 className="text-lg font-bold text-on-surface">Behavioral DNA Insights</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-surface-container-low p-4 rounded-lg flex gap-4 border-l-2 border-primary/30">
              <Info className="text-primary w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-on-surface">The "Friday Spike" Pattern</p>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">You tend to overspend on high-calorie experiences on Friday evenings. Shifting social plans to Saturday brunch could save you {formatDualCurrency(450).main} {formatDualCurrency(450).sub ? `(${formatDualCurrency(450).sub})` : ''}/mo.</p>
              </div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-lg flex gap-4 border-l-2 border-secondary/30">
              <TrendingUp className="text-secondary w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-on-surface">Savings Velocity Increasing</p>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">Your automated vault transfers have increased by 12% this quarter. Your DNA score will hit 185 by next month if this holds.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-on-surface">Unlocked Badges</h2>
            <span className="text-[10px] font-black uppercase text-primary cursor-pointer">View All</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Landmark, label: 'Disciplined Saver' },
              { icon: Zap, label: 'Early Investor' },
              { icon: Sword, label: 'Debt Slayer' },
            ].map((badge, idx) => (
              <div key={idx} className="aspect-square bg-surface-container rounded-xl flex items-center justify-center group hover:bg-primary/5 transition-colors cursor-help" title={badge.label}>
                <badge.icon className="text-primary w-8 h-8 group-hover:scale-110 transition-transform fill-primary/20" />
              </div>
            ))}
            <div className="aspect-square bg-surface-container rounded-xl flex items-center justify-center opacity-30 grayscale">
              <Diamond className="text-on-surface-variant w-8 h-8" />
            </div>
            <div className="aspect-square bg-surface-container rounded-xl flex items-center justify-center opacity-30 grayscale">
              <Landmark className="text-on-surface-variant w-8 h-8" />
            </div>
            <div className="aspect-square bg-surface-container rounded-xl flex items-center justify-center border border-dashed border-outline-variant">
              <Lock className="text-on-surface-variant/40 w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* 1000-Day Wealth Challenge */}
      <section className="bg-surface-container rounded-2xl p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">The Long Game</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-on-surface">1000-Day Wealth Challenge</h2>
            <p className="text-on-surface-variant text-sm max-w-md">You are currently at Day 422. Reaching 1,000 days of consistent budget tracking unlocks the "Sovereign Executive" legacy status.</p>
          </div>
          <div className="flex-1 max-w-md w-full bg-surface-container-low p-6 rounded-xl border border-outline-variant/20">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-on-surface">Milestone Progress</span>
              <span className="text-xs font-black text-primary">42.2%</span>
            </div>
            <div className="flex gap-1.5 h-8">
              {[0.2, 0.4, 0.6, 0.8, 1].map((op, i) => (
                <div key={i} className="flex-1 bg-primary rounded-sm" style={{ opacity: op }}></div>
              ))}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex-1 bg-surface-container-highest rounded-sm"></div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-center text-on-surface-variant uppercase tracking-widest">Next Major Drop: Day 500 (Exclusive UI Theme)</p>
          </div>
        </div>
      </section>
    </div>
  );
};


const BrainCircuit = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.105 4 4 0 0 0 7.327-2.338 3 3 0 1 0 5.997-.125 4 4 0 0 0 2.526-5.77 4 4 0 0 0-.52-8.105 4 4 0 0 0-7.327 2.338Z"/><path d="M9 13a4.5 4.5 0 0 0 3-4"/><path d="M15 11a4.5 4.5 0 0 1-3 4"/><path d="M12 12h.01"/></svg>
);
