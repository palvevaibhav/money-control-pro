import React, { useEffect, useState } from 'react';
import { Fingerprint, LockKeyhole, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';
import { auth, signOut } from '../lib/firebase';
import { canUseBiometricLock, requestBiometricUnlock } from '../lib/security';
import { SecurityPreferences, storage, subscribeToStorageSync } from '../lib/storage';

interface AppLockGateProps {
  enabled: boolean;
}

export const AppLockGate = ({ enabled }: AppLockGateProps) => {
  const [locked, setLocked] = useState(enabled);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncLockPreference = () => {
      const preferences: SecurityPreferences = storage.getSecurityPreferences();
      setLocked(Boolean(preferences.biometricLockEnabled));
    };

    syncLockPreference();
    return subscribeToStorageSync(syncLockPreference);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLocked(false);
      return;
    }

    const checkAvailability = async () => {
      const available = await canUseBiometricLock();
      setBiometricAvailable(available);
      if (!available) {
        setError('Biometric authentication is not available on this device yet.');
      }
    };

    void checkAvailability();
  }, [enabled]);

  const handleUnlock = async () => {
    setUnlocking(true);
    setError(null);

    const unlocked = await requestBiometricUnlock('Unlock Money Control Pro');

    if (unlocked) {
      setLocked(false);
    } else {
      setError('Biometric verification failed. Please try again.');
    }

    setUnlocking(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (enabled && biometricAvailable && locked && !unlocking) {
      void handleUnlock();
    }
  }, [enabled, biometricAvailable, locked]);

  if (!enabled || !locked) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[300] bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface-container border border-outline-variant/10 rounded-[2rem] p-8 space-y-6 shadow-2xl">
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center">
            {biometricAvailable ? (
              <Fingerprint className="w-10 h-10 text-primary" />
            ) : (
              <ShieldAlert className="w-10 h-10 text-amber-400" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">App Lock</p>
            <h2 className="text-3xl font-black tracking-tight">Secure Unlock Required</h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Use Face ID, fingerprint, or your device biometric prompt to access your encrypted vault.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm rounded-2xl p-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleUnlock}
            disabled={!biometricAvailable || unlocking}
            className="w-full bg-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {unlocking ? <RefreshCw className="w-5 h-5 animate-spin" /> : <LockKeyhole className="w-5 h-5" />}
            Unlock App
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-surface-container-highest text-rose-400 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
