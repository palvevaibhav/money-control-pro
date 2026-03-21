import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, User } from 'lucide-react';

interface SignupPageProps {
  onSignupSwitch?: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignupSwitch }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!email || !username || !password) {
      setError('Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });

      // Save to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        email,
        createdAt: new Date().toISOString(),
        emailVerified: false,
      });

      alert('Signup successful! Please login.');
      onSignupSwitch?.(); // Switch to login
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 text-center relative z-10"
      >
        {/* Logo */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-primary/10 border border-primary/20">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-on-surface">Sign Up</h1>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/60">
              Create Your Account
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline/20 focus:border-primary focus:outline-none transition-colors text-on-surface placeholder-on-surface-variant/60"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline/20 focus:border-primary focus:outline-none transition-colors text-on-surface placeholder-on-surface-variant/60"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline/20 focus:border-primary focus:outline-none transition-colors text-on-surface placeholder-on-surface-variant/60"
              />
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-semibold shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-sm text-on-surface-variant">
            Already have an account?{' '}
            <button
              onClick={onSignupSwitch}
              className="text-primary font-semibold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};