import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { LogIn, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-12 text-center relative z-10"
      >
        {/* Logo Section */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-primary/10 border border-primary/20">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-on-surface">Money Control Pro</h1>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/60">Sovereign Financial Architecture</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container p-4 rounded-3xl border border-outline-variant/10 space-y-2">
            <Zap className="w-5 h-5 text-amber-400 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Cloud Sync</p>
          </div>
          <div className="bg-surface-container p-4 rounded-3xl border border-outline-variant/10 space-y-2">
            <Globe className="w-5 h-5 text-primary mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Global Access</p>
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-on-surface text-surface py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign in with Google
              </>
            )}
          </button>
          
          {error && (
            <p className="text-xs font-bold text-rose-500 bg-rose-500/10 py-3 px-4 rounded-xl border border-rose-500/20">
              {error}
            </p>
          )}

          <p className="text-[10px] font-medium text-on-surface-variant/40 leading-relaxed px-8">
            By signing in, you agree to our terms of service and acknowledge our sovereign data protection protocols.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
