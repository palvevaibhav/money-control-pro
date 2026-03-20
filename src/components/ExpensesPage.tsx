import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { storage } from '../lib/storage';
import { Transaction } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { LedgerView } from './LedgerView';
import { formatDualCurrency } from '../lib/currency';
import { auth } from '../lib/firebase';

export const ExpensesPage = () => {
  const [activeView, setActiveView] = useState<'transactions' | 'ledger'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [newTx, setNewTx] = useState({
    amount: '',
    category: 'Food',
    description: '',
    type: 'expense' as 'expense' | 'income'
  });

  useEffect(() => {
    setTransactions(storage.getTransactions());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      uid: auth.currentUser.uid,
      amount: parseFloat(newTx.amount),
      category: newTx.category,
      description: newTx.description,
      type: newTx.type,
      date: new Date().toISOString(),
    };
    storage.saveTransaction(tx);
    setTransactions([tx, ...transactions]);
    setShowAdd(false);
    setNewTx({ amount: '', category: 'Food', description: '', type: 'expense' });
  };

  const handleDelete = (id: string) => {
    storage.deleteTransaction(id);
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const filtered = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                         t.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tighter text-on-surface">Expenses</h1>
        {activeView === 'transactions' && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-primary text-on-primary p-3 rounded-full shadow-lg shadow-primary/20 active:scale-90 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* View Switcher */}
      <div className="flex bg-surface-container p-1 rounded-2xl">
        <button 
          onClick={() => setActiveView('transactions')}
          className={cn(
            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
            activeView === 'transactions' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant"
          )}
        >Transactions</button>
        <button 
          onClick={() => setActiveView('ledger')}
          className={cn(
            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
            activeView === 'ledger' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant"
          )}
        >Ledger</button>
      </div>

      {activeView === 'transactions' ? (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-container border-none rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-surface-container border-none rounded-xl px-3 py-3 text-xs font-bold text-on-surface-variant focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </select>
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="bg-surface-container p-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <Filter className={cn("w-5 h-5 transition-transform", sortOrder === 'desc' ? "rotate-180" : "")} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'expense', 'income'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap",
                  filter === f ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((t) => {
                const amountFormatted = formatDualCurrency(t.amount);
                
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-surface-container p-4 rounded-2xl flex items-center justify-between group border border-outline-variant/10 hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                         t.type === 'income' 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" 
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/20"
                       )}>
                        {t.type === 'income' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-on-surface tracking-tight">{t.description || t.category}</p>
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-tighter",
                            t.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>
                            {t.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-surface-container-lowest text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full border border-outline-variant/10">
                            {t.category}
                          </span>
                          <span className="text-[10px] text-on-surface-variant/60 font-medium">
                            {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={cn(
                           "font-black text-xl tracking-tighter",
                           t.type === 'income' ? "text-emerald-400" : "text-on-surface"
                         )}>
                          {t.type === 'income' ? '+' : '-'}{amountFormatted.main}
                        </p>
                        {amountFormatted.sub && (
                          <p className="text-[10px] font-bold text-on-surface-variant/60">{amountFormatted.sub}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="text-on-surface-variant/40 hover:text-rose-500 transition-colors p-2 bg-surface-container-lowest rounded-xl border border-outline-variant/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <LedgerView />
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-4">
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="bg-surface w-full max-w-md rounded-t-3xl md:rounded-3xl p-8 space-y-6 border-t border-outline-variant/20"
          >
            <h2 className="text-2xl font-black tracking-tighter text-on-surface">Add Transaction</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex bg-surface-container p-1 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setNewTx({ ...newTx, type: 'expense' })}
                  className={cn("flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all", newTx.type === 'expense' ? "bg-rose-500 text-white" : "text-on-surface-variant")}
                >Expense</button>
                <button 
                  type="button"
                  onClick={() => setNewTx({ ...newTx, type: 'income' })}
                  className={cn("flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all", newTx.type === 'income' ? "bg-emerald-500 text-white" : "text-on-surface-variant")}
                >Income</button>
              </div>
              <input 
                type="number" 
                placeholder="0.00"
                required
                value={newTx.amount}
                onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                className="w-full bg-surface-container border-none rounded-xl p-4 text-2xl font-black text-on-surface focus:ring-2 focus:ring-primary"
              />
              <input 
                type="text" 
                placeholder="Description"
                value={newTx.description}
                onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                className="w-full bg-surface-container border-none rounded-xl p-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
              />
              <select 
                value={newTx.category}
                onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                className="w-full bg-surface-container border-none rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary"
              >
                <option>Food</option>
                <option>Shopping</option>
                <option>Transport</option>
                <option>Rent</option>
                <option>Salary</option>
                <option>Investment</option>
              </select>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-4 rounded-xl font-bold text-on-surface-variant hover:bg-white/5"
                >Cancel</button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-xl font-bold bg-primary text-on-primary"
                >Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
