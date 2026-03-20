import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Calculator, 
  Plus, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  X,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Lending } from '../types';
import { storage } from '../lib/storage';
import { formatDualCurrency } from '../lib/currency';
import { auth } from '../lib/firebase';

export const LedgerView = () => {
  const [lending, setLending] = useState<Lending[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<Lending>>({
    type: 'lent',
    amount: 0,
    interestRate: 0,
    person: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: ''
  });

  useEffect(() => {
    setLending(storage.getLending());
  }, []);

  const totalReceivables = lending.filter(l => l.type === 'lent').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPayables = lending.filter(l => l.type === 'borrowed').reduce((acc, curr) => acc + curr.amount, 0);

  const handleDeleteEntry = (id: string) => {
    storage.deleteLending(id);
    setLending(storage.getLending());
  };

  const handleAddEntry = () => {
    if (!newEntry.person || !newEntry.amount || !auth.currentUser) return;
    
    const entry: Lending = {
      id: Math.random().toString(36).substr(2, 9),
      uid: auth.currentUser.uid,
      person: newEntry.person!,
      amount: Number(newEntry.amount),
      type: newEntry.type as 'lent' | 'borrowed',
      date: newEntry.date!,
      interestRate: Number(newEntry.interestRate) || 0,
      dueDate: newEntry.dueDate || ''
    };

    storage.saveLending(entry);
    setLending(storage.getLending());
    setShowAddModal(false);
    setNewEntry({
      type: 'lent',
      amount: 0,
      interestRate: 0,
      person: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: ''
    });
  };

  const receivablesFormatted = formatDualCurrency(totalReceivables);
  const payablesFormatted = formatDualCurrency(totalPayables);

  return (
    <div className="space-y-8 pb-20">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Active Receivables */}
        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">Active Receivables</p>
            <div className="flex flex-col">
              <h2 className="text-3xl font-black tracking-tighter text-primary">{receivablesFormatted.main}</h2>
              {receivablesFormatted.sub && (
                <span className="text-sm font-bold text-on-surface-variant/60">{receivablesFormatted.sub}</span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Lent to {lending.filter(l => l.type === 'lent').length} recipients
            </p>
          </div>
        </div>

        {/* Active Payables */}
        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingDown className="w-24 h-24 text-rose-400" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">Active Payables</p>
            <div className="flex flex-col">
              <h2 className="text-3xl font-black tracking-tighter text-rose-300">{payablesFormatted.main}</h2>
              {payablesFormatted.sub && (
                <span className="text-sm font-bold text-on-surface-variant/60">{payablesFormatted.sub}</span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant font-medium">
              Owed to {lending.filter(l => l.type === 'borrowed').length} lenders
            </p>
          </div>
        </div>
      </div>

      {/* Active Ledger Entries */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-black text-xl tracking-tight text-on-surface">Ledger Entries</h2>
          {lending.length > 0 && (
            <div className="flex gap-2">
              <button className="bg-surface-container-high px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Recent</button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {lending.length === 0 ? (
            <div className="bg-surface-container p-12 rounded-3xl border border-dashed border-outline-variant/20 text-center">
              <p className="text-on-surface-variant font-bold">No entries yet</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">Start tracking your lending and borrowing</p>
            </div>
          ) : (
            lending.map((item) => {
              const amountFormatted = formatDualCurrency(item.amount);
              const interestAmount = (item.amount * item.interestRate / 100);
              const interestFormatted = formatDualCurrency(interestAmount);

              return (
                <div key={item.id} className="bg-surface-container p-6 rounded-3xl space-y-6 border border-outline-variant/5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-black text-xs">
                        {item.person.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{item.person}</p>
                        <p className="text-[10px] text-on-surface-variant/60 font-medium">Date: {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-3 py-1 rounded-md tracking-widest",
                        item.type === 'lent' ? "bg-primary/10 text-primary" : "bg-rose-500/10 text-rose-400"
                      )}>
                        {item.type === 'lent' ? 'Receivable' : 'Payable'}
                      </span>
                      <button 
                        onClick={() => handleDeleteEntry(item.id)}
                        className="p-2 text-on-surface-variant/40 hover:text-rose-500 transition-colors bg-surface-container-highest rounded-xl border border-outline-variant/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Principal</p>
                      <p className="text-lg font-black text-on-surface">{amountFormatted.main}</p>
                      {amountFormatted.sub && <p className="text-[10px] font-bold text-on-surface-variant/60">{amountFormatted.sub}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Interest ({item.interestRate}%)</p>
                      <p className={cn(
                        "text-lg font-black",
                        item.type === 'lent' ? "text-primary" : "text-rose-400"
                      )}>
                        {item.type === 'lent' ? '+' : '-'}{interestFormatted.main}
                      </p>
                      {interestFormatted.sub && <p className="text-[10px] font-bold text-on-surface-variant/60">{interestFormatted.sub}</p>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-surface-container rounded-[2rem] p-8 shadow-2xl border border-outline-variant/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tight">New Entry</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2 p-1 bg-surface-container-low rounded-2xl">
                  <button 
                    onClick={() => setNewEntry({ ...newEntry, type: 'lent' })}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      newEntry.type === 'lent' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant/60"
                    )}
                  >
                    Lent
                  </button>
                  <button 
                    onClick={() => setNewEntry({ ...newEntry, type: 'borrowed' })}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      newEntry.type === 'borrowed' ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-on-surface-variant/60"
                    )}
                  >
                    Borrowed
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Person / Entity</label>
                  <input 
                    type="text"
                    value={newEntry.person}
                    onChange={(e) => setNewEntry({ ...newEntry, person: e.target.value })}
                    placeholder="Who is this with?"
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-5 py-4 text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Amount (₹)</label>
                    <input 
                      type="number"
                      value={newEntry.amount || ''}
                      onChange={(e) => setNewEntry({ ...newEntry, amount: Number(e.target.value) })}
                      placeholder="0.00"
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-5 py-4 text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Interest %</label>
                    <input 
                      type="number"
                      value={newEntry.interestRate || ''}
                      onChange={(e) => setNewEntry({ ...newEntry, interestRate: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl px-5 py-4 text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddEntry}
                  className="w-full py-5 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4"
                >
                  Create Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 bg-primary text-on-primary p-5 rounded-3xl shadow-2xl shadow-primary/40 active:scale-90 transition-all z-50"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};
