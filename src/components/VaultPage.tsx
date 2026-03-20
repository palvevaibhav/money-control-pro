import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { Goal } from '../types';
import confetti from 'canvas-confetti';
import { cn } from '../lib/utils';
import { LedgerView } from './LedgerView';
import { formatDualCurrency } from '../lib/currency';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Goal) => void;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [icon, setIcon] = useState('🎯');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      uid: auth.currentUser.uid,
      name,
      targetAmount: parseFloat(target),
      currentAmount: 0,
      icon,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };
    onAdd(newGoal);
    onClose();
    setName('');
    setTarget('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface w-full max-w-md rounded-3xl p-8 space-y-6 border border-white/10 shadow-2xl"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tighter text-on-surface">New Goal</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-on-surface-variant" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Goal Name</label>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Laptop"
              className="w-full bg-surface-container p-4 rounded-2xl border border-white/5 text-on-surface focus:border-primary/50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Target Amount ($)</label>
            <input 
              required
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="0.00"
              className="w-full bg-surface-container p-4 rounded-2xl border border-white/5 text-on-surface focus:border-primary/50 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Icon</label>
            <div className="flex gap-2">
              {['🎯', '🏠', '🚗', '💻', '✈️', '🎓'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all",
                    icon === emoji ? "bg-primary text-on-primary scale-110" : "bg-surface-container hover:bg-white/5"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-primary text-on-primary py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-[0.98] transition-all mt-4"
          >
            Create Goal
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export const VaultPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<'goals' | 'lending'>('goals');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setGoals(storage.getGoals());
  }, []);

  const handleGoalProgress = (id: string) => {
    const amount = 500; // Mock contribution
    storage.updateGoal(id, amount);
    const updated = goals.map(g => {
      if (g.id === id) {
        const newAmount = g.currentAmount + amount;
        if (newAmount >= g.targetAmount) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#44f3a9', '#ffffff', '#00d68f']
          });
        }
        return { ...g, currentAmount: newAmount };
      }
      return g;
    });
    setGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    storage.deleteGoal(id);
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleAddGoal = (goal: Goal) => {
    storage.saveGoal(goal);
    setGoals([...goals, goal]);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tighter text-on-surface">Vault</h1>
        {activeTab === 'goals' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-on-primary p-3 rounded-full shadow-lg shadow-primary/20 active:scale-90 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      <GoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddGoal} 
      />

      <div className="flex bg-surface-container p-1 rounded-2xl">
        <button 
          onClick={() => setActiveTab('goals')}
          className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'goals' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant")}
        >Savings Goals</button>
        <button 
          onClick={() => setActiveTab('lending')}
          className={cn("flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'lending' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant")}
        >Lending Tracker</button>
      </div>

      {activeTab === 'goals' ? (
        <div className="space-y-4">
          {goals.length === 0 && (
            <div className="bg-surface-container p-8 rounded-2xl text-center space-y-4">
              <Target className="w-12 h-12 text-on-surface-variant/20 mx-auto" />
              <p className="text-on-surface-variant font-medium">No active goals. Start saving for your dreams!</p>
            </div>
          )}
          {goals.map((goal) => {
            const currentFormatted = formatDualCurrency(goal.currentAmount);
            const targetFormatted = formatDualCurrency(goal.targetAmount);
            
            return (
              <div key={goal.id} className="bg-surface-container p-6 rounded-2xl space-y-4 border border-outline-variant/5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl bg-surface-container-lowest p-3 rounded-xl">{goal.icon}</div>
                    <div>
                      <h3 className="font-bold text-on-surface">{goal.name}</h3>
                      <p className="text-xs text-on-surface-variant">Target: {targetFormatted.main}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleGoalProgress(goal.id)}
                      className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="bg-rose-500/10 text-rose-500 p-2 rounded-lg hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    <span>{currentFormatted.main}</span>
                    <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <LedgerView />
      )}
    </div>
  );
};
