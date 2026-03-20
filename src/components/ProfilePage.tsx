import React, { useState } from 'react';
import { 
  Shield, 
  Database, 
  FileUp, 
  MessageSquare, 
  Sparkles, 
  Fingerprint, 
  Hash, 
  Bot, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  Info,
  ChevronRight,
  Bell,
  Coins,
  Trash2,
  LogOut,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { storage, AppSettings } from '../lib/storage';
import { auth, signOut } from '../lib/firebase';

export const ProfilePage = () => {
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [autoDetection, setAutoDetection] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [pinLock, setPinLock] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••••••••••');
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const currentUser = auth.currentUser;

  const updateCurrency = (currency: AppSettings['currency']) => {
    const newSettings = { ...settings, currency };
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleReset = () => {
    storage.clearUserData();
  };

  const Toggle = ({ enabled, setEnabled }: { enabled: boolean, setEnabled: (v: boolean) => void }) => (
    <button 
      onClick={() => setEnabled(!enabled)}
      className={cn(
        "w-12 h-6 rounded-full transition-colors relative",
        enabled ? "bg-primary" : "bg-surface-container-highest"
      )}
    >
      <div className={cn(
        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
        enabled ? "left-7" : "left-1"
      )} />
    </button>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Vault Configuration</p>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface">System Control</h1>
      </div>

      {/* User Profile Card */}
      <div className="bg-surface-container p-6 rounded-[2.5rem] border border-outline-variant/10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-primary/20">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black tracking-tight text-on-surface">{currentUser?.displayName || 'Sovereign User'}</h2>
            <p className="text-xs text-on-surface-variant font-medium">{currentUser?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 bg-surface-container-highest text-rose-500 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-500/10 transition-all border border-rose-500/10"
        >
          <LogOut className="w-4 h-4" />
          Terminate Session
        </button>
      </div>

      {/* Data Integrity Card */}
      <div className="bg-surface-container p-5 rounded-2xl flex items-center gap-4 border border-outline-variant/5">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Data Integrity</p>
          <p className="font-bold text-on-surface leading-tight">Local Data Storage: Private & Encrypted</p>
        </div>
      </div>

      {/* Currency Preferences */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Coins className="w-5 h-5 text-primary" />
          <h2 className="font-black text-lg tracking-tight">Currency Preferences</h2>
        </div>

        <div className="bg-surface-container p-2 rounded-2xl border border-outline-variant/5 flex gap-1">
          {[
            { id: 'USD', label: 'USD ($)' },
            { id: 'INR', label: 'INR (₹)' },
            { id: 'DUAL', label: 'Dual Mode' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => updateCurrency(opt.id as AppSettings['currency'])}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                settings.currency === opt.id 
                  ? "bg-primary text-black shadow-lg shadow-primary/20" 
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="px-4 text-[10px] text-on-surface-variant leading-relaxed">
          {settings.currency === 'DUAL' 
            ? "Dual Mode displays both USD and INR across all financial insights."
            : `System will prioritize ${settings.currency} for all architectural projections.`}
        </p>
      </div>

      {/* Smart Data Import Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="font-black text-lg tracking-tight">Smart Data Import</h2>
        </div>

        <div className="space-y-3">
          {/* Connect Bank */}
          <div className="bg-surface-container p-6 rounded-3xl space-y-4 border border-outline-variant/5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-on-surface">Connect Bank</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Import transactional data via Excel/CSV or Direct API sync.
              </p>
            </div>
            <button className="flex items-center gap-2 text-primary text-sm font-black uppercase tracking-widest pt-2">
              Configure <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* SMS Parser */}
          <div className="bg-surface-container p-6 rounded-3xl space-y-4 border border-outline-variant/5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-on-surface">SMS Parser Setup</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Automatically extract expense data from bank notification messages.
              </p>
            </div>
            <button className="flex items-center gap-2 text-primary text-sm font-black uppercase tracking-widest pt-2">
              Edit Rules <div className="flex gap-0.5"><div className="w-0.5 h-3 bg-primary/40" /><div className="w-0.5 h-3 bg-primary" /><div className="w-0.5 h-3 bg-primary/40" /></div>
            </button>
          </div>

          {/* Auto Detection */}
          <div className="bg-surface-container p-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-surface-container to-primary/5">
            <div className="flex justify-between items-start mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <Toggle enabled={autoDetection} setEnabled={setAutoDetection} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-on-surface">Auto Detection</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Continuous background scan for newly imported statement files.
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary pt-2">System Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-black text-lg tracking-tight">Security</h2>
        </div>

        <div className="space-y-3">
          {/* Biometric */}
          <div className="bg-surface-container p-5 rounded-2xl flex items-center justify-between border border-outline-variant/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-on-surface">Biometric Authentication</p>
                <p className="text-xs text-on-surface-variant">FaceID or TouchID integration</p>
              </div>
            </div>
            <Toggle enabled={biometric} setEnabled={setBiometric} />
          </div>

          {/* PIN Lock */}
          <div className="bg-surface-container p-5 rounded-2xl flex items-center justify-between border border-outline-variant/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <Hash className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-on-surface">PIN Lock</p>
                <p className="text-xs text-on-surface-variant">Backup 6-digit access code</p>
              </div>
            </div>
            <Toggle enabled={pinLock} setEnabled={setPinLock} />
          </div>
        </div>
      </div>

      {/* AI Setup Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Bot className="w-5 h-5 text-primary" />
          <h2 className="font-black text-lg tracking-tight">AI Setup</h2>
        </div>

        <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant/10 space-y-6">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Connect your Anthropic/Claude account to enable professional-grade financial forecasting and intelligent categorization. Your API key is encrypted locally.
          </p>
          
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Anthropic API Key</p>
            <div className="relative">
              <input 
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-xl p-4 pr-12 text-sm text-on-surface font-mono"
              />
              <button 
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button className="w-full bg-primary text-on-primary py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
            Save Key
          </button>

          <div className="flex items-start gap-3 text-on-surface-variant/60">
            <Info className="w-4 h-4 mt-0.5" />
            <p className="text-xs leading-relaxed">
              System uses Claude 3.5 Sonnet for optimal analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Reset Data Section */}
      <div className="space-y-4 pt-8">
        <div className="flex items-center gap-3 px-1">
          <Trash2 className="w-5 h-5 text-rose-500" />
          <h2 className="font-black text-lg tracking-tight text-rose-500">Danger Zone</h2>
        </div>

        <div className="bg-surface-container p-6 rounded-3xl border border-rose-500/20 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-on-surface">System Reset</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This will permanently delete all your transactions, savings goals, lending records, and financial stats. This action cannot be undone.
            </p>
          </div>
          {!showResetConfirm ? (
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all"
            >
              Reset All Data
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-surface-container-highest text-on-surface py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleReset}
                className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all"
              >
                Confirm Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
