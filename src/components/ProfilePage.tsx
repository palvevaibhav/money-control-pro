import React, { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Coins,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  LogOut,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { auth, signOut } from '../lib/firebase';
import {
  appendIntegrityEvent,
  canUseBiometricLock,
  ensureUserSecurityIdentity,
  requestBiometricUnlock,
  sealCurrentUserVault,
  verifyCurrentUserVaultSeal,
  verifyIntegrityChainForCurrentUser,
} from '../lib/security';
import { AppSettings, storage } from '../lib/storage';
import type { SecurityPreferences } from '../lib/storage';

export const ProfilePage = () => {
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [securityPreferences, setSecurityPreferences] = useState<SecurityPreferences>(
    storage.getSecurityPreferences(),
  );
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [securityTone, setSecurityTone] = useState<'success' | 'warning'>('success');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••••••••••');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const loadSecurityState = async () => {
      setBiometricAvailable(await canUseBiometricLock());
      const verification = await verifyIntegrityChainForCurrentUser();

      if (verification.recordCount > 0) {
        setSecurityMessage(
          verification.valid
            ? `Integrity shield verified ${verification.recordCount} checkpoint${verification.recordCount === 1 ? '' : 's'}.`
            : 'Integrity warning: current data differs from the last recorded checkpoint.',
        );
        setSecurityTone(verification.valid ? 'success' : 'warning');
      }
    };

    void loadSecurityState();
  }, []);

  const updateCurrency = (currency: AppSettings['currency']) => {
    const newSettings = { ...settings, currency };
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const saveSecurityPreferences = (nextPreferences: SecurityPreferences) => {
    setSecurityPreferences(nextPreferences);
    storage.saveSecurityPreferences(nextPreferences);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleReset = () => {
    storage.clearUserData();
  };

  const handleBiometricToggle = async () => {
    if (securityPreferences.biometricLockEnabled) {
      saveSecurityPreferences({
        ...securityPreferences,
        biometricLockEnabled: false,
      });
      setSecurityMessage('Biometric app lock disabled.');
      setSecurityTone('warning');
      return;
    }

    if (!biometricAvailable) {
      setSecurityMessage('This device does not currently expose Face ID / fingerprint auth to the app.');
      setSecurityTone('warning');
      return;
    }

    setWorking('biometric');
    const unlocked = await requestBiometricUnlock('Enable biometric app lock');

    if (unlocked) {
      saveSecurityPreferences({
        ...securityPreferences,
        biometricLockEnabled: true,
      });
      setSecurityMessage('Biometric app lock enabled successfully.');
      setSecurityTone('success');
    } else {
      setSecurityMessage('Biometric verification failed. App lock was not enabled.');
      setSecurityTone('warning');
    }

    setWorking(null);
  };

  const handleCreateKeys = async () => {
    setWorking('keys');
    const identity = await ensureUserSecurityIdentity();

    if (identity) {
      saveSecurityPreferences({
        ...securityPreferences,
        encryptionEnabled: true,
        publicKeyFingerprint: identity.publicKeyFingerprint,
        keyPairCreatedAt: identity.createdAt,
      });
      setSecurityMessage(`User keypair generated. Public key fingerprint: ${identity.publicKeyFingerprint}`);
      setSecurityTone('success');
    }

    setWorking(null);
  };

  const handleSealVault = async () => {
    setWorking('seal');
    const seal = await sealCurrentUserVault();

    if (seal) {
      saveSecurityPreferences({
        ...securityPreferences,
        encryptionEnabled: true,
        publicKeyFingerprint: seal.publicKeyFingerprint,
        lastSealAt: seal.createdAt,
      });
      setSecurityMessage('Encrypted vault sealed successfully with user-side public key wrapping.');
      setSecurityTone('success');
    }

    setWorking(null);
  };

  const handleIntegrityCheckpoint = async () => {
    setWorking('integrity');
    await appendIntegrityEvent('manual-checkpoint');
    const result = await verifyIntegrityChainForCurrentUser();

    saveSecurityPreferences({
      ...securityPreferences,
      integrityShieldEnabled: true,
      lastIntegrityCheckAt: new Date().toISOString(),
    });
    setSecurityMessage(
      result.valid
        ? `Integrity checkpoint recorded. Chain length: ${result.recordCount}.`
        : 'Integrity checkpoint failed verification. Review local data before proceeding.',
    );
    setSecurityTone(result.valid ? 'success' : 'warning');
    setWorking(null);
  };

  const handleVerifyVault = async () => {
    setWorking('verify-vault');
    const result = await verifyCurrentUserVaultSeal();

    if (result) {
      setSecurityMessage(
        result.valid
          ? `Encrypted vault verified successfully from ${new Date(result.createdAt).toLocaleString()}.`
          : 'Vault verification failed. The sealed snapshot may have been altered.',
      );
      setSecurityTone(result.valid ? 'success' : 'warning');
    } else {
      setSecurityMessage('No sealed vault exists yet. Create keys and seal the vault first.');
      setSecurityTone('warning');
    }

    setWorking(null);
  };

  const statusToneClasses = useMemo(
    () =>
      securityTone === 'success'
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
        : 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    [securityTone],
  );

  const Toggle = ({ enabled, onClick }: { enabled: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={cn(
        'w-12 h-6 rounded-full transition-colors relative',
        enabled ? 'bg-primary' : 'bg-surface-container-highest',
      )}
    >
      <div
        className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
          enabled ? 'left-7' : 'left-1',
        )}
      />
    </button>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Security & Identity</p>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface">System Control</h1>
      </div>

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

      <div className="bg-surface-container p-5 rounded-2xl flex items-center gap-4 border border-outline-variant/5">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Security Posture</p>
          <p className="font-bold text-on-surface leading-tight">
            {securityPreferences.encryptionEnabled ? 'Client-side key material active' : 'Standard local protection active'}
          </p>
        </div>
      </div>

      {securityMessage && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('border rounded-2xl p-4 text-sm', statusToneClasses)}
        >
          {securityMessage}
        </motion.div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Coins className="w-5 h-5 text-primary" />
          <h2 className="font-black text-lg tracking-tight">Currency Preferences</h2>
        </div>

        <div className="bg-surface-container p-2 rounded-2xl border border-outline-variant/5 flex gap-1">
          {[
            { id: 'USD', label: 'USD ($)' },
            { id: 'INR', label: 'INR (₹)' },
            { id: 'DUAL', label: 'Dual Mode' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => updateCurrency(option.id as AppSettings['currency'])}
              className={cn(
                'flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                settings.currency === option.id
                  ? 'bg-primary text-black shadow-lg shadow-primary/20'
                  : 'text-on-surface-variant hover:bg-surface-container-highest',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-black text-lg tracking-tight">Security Center</h2>
        </div>

        <div className="space-y-3">
          <div className="bg-surface-container p-5 rounded-2xl flex items-center justify-between border border-outline-variant/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-on-surface">Biometric App Lock</p>
                <p className="text-xs text-on-surface-variant">
                  {biometricAvailable ? 'Fingerprint / Face ID available' : 'Device biometric auth not exposed yet'}
                </p>
              </div>
            </div>
            <Toggle enabled={securityPreferences.biometricLockEnabled} onClick={() => void handleBiometricToggle()} />
          </div>

          <div className="bg-surface-container p-6 rounded-3xl space-y-4 border border-outline-variant/5">
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-bold text-on-surface">End-to-End Vault Keys</h3>
                <p className="text-xs text-on-surface-variant">
                  Create a user-side public/private keypair and seal local data with encrypted snapshots.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => void handleCreateKeys()}
                disabled={working === 'keys'}
                className="py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest disabled:opacity-50"
              >
                {working === 'keys' ? 'Generating…' : 'Create User Keys'}
              </button>
              <button
                onClick={() => void handleSealVault()}
                disabled={working === 'seal'}
                className="py-4 rounded-2xl bg-surface-container-highest text-on-surface font-black uppercase tracking-widest disabled:opacity-50"
              >
                {working === 'seal' ? 'Sealing…' : 'Seal Encrypted Vault'}
              </button>
            </div>

            <div className="rounded-2xl bg-surface-container-lowest p-4 text-xs text-on-surface-variant space-y-2">
              <p>
                <span className="font-black text-on-surface">Public key fingerprint:</span>{' '}
                {securityPreferences.publicKeyFingerprint || 'Not created yet'}
              </p>
              <p>
                <span className="font-black text-on-surface">Last sealed vault:</span>{' '}
                {securityPreferences.lastSealAt ? new Date(securityPreferences.lastSealAt).toLocaleString() : 'Never'}
              </p>
              <p>
                Snapshot sealing encrypts the current ledger with AES-GCM and wraps the vault key with the user public key.
              </p>
            </div>
          </div>

          <div className="bg-surface-container p-6 rounded-3xl space-y-4 border border-outline-variant/5">
            <div className="flex items-center gap-3">
              <LockKeyhole className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-bold text-on-surface">Tamper-Evident Integrity Shield</h3>
                <p className="text-xs text-on-surface-variant">
                  Creates a chained hash log so unexpected local data modifications can be detected.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => void handleIntegrityCheckpoint()}
                disabled={working === 'integrity'}
                className="py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest disabled:opacity-50"
              >
                {working === 'integrity' ? 'Recording…' : 'Record Checkpoint'}
              </button>
              <button
                onClick={() => void handleVerifyVault()}
                disabled={working === 'verify-vault'}
                className="py-4 rounded-2xl bg-surface-container-highest text-on-surface font-black uppercase tracking-widest disabled:opacity-50"
              >
                {working === 'verify-vault' ? 'Verifying…' : 'Verify Sealed Vault'}
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              This is a tamper-evident hash chain inside the app, not a public blockchain. It gives you integrity verification now while keeping room for future server anchoring.
            </p>
          </div>
        </div>
      </div>

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
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
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
        </div>
      </div>

      <div className="space-y-4 pt-8">
        <div className="flex items-center gap-3 px-1">
          <Trash2 className="w-5 h-5 text-rose-500" />
          <h2 className="font-black text-lg tracking-tight text-rose-500">Danger Zone</h2>
        </div>

        <div className="bg-surface-container p-6 rounded-3xl border border-rose-500/20 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-on-surface">System Reset</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This will permanently delete all your transactions, goals, lending records, financial stats, sealed vaults, and local security materials.
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
                Confirm Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
