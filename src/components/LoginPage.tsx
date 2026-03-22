import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Globe, Smartphone, Mail, Lock, Phone } from 'lucide-react';
import {
  auth,
  googleProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
} from '../lib/firebase';
import { isNativePlatform } from '../lib/native';

interface LoginPageProps {
  onSignupSwitch?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSignupSwitch }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nativePlatform = isNativePlatform();

  // Email/Password Login
  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login successful!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Login
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-login', {
          size: 'invisible',
        });
      }

      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      alert('OTP sent successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) return;

    try {
      setLoading(true);
      setError(null);

      await confirmationResult.confirm(otp);
      alert('Logged in successfully!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      alert('Google login successful!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google login failed');
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
            <h1 className="text-4xl font-black tracking-tighter text-on-surface">Money Control Pro</h1>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-on-surface-variant/60">
              Sovereign Financial Architecture
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container p-4 rounded-3xl border border-outline-variant/10 space-y-2">
            <Zap className="w-5 h-5 text-amber-400 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Cloud Sync</p>
          </div>
          <div className="bg-surface-container p-4 rounded-3xl border border-outline-variant/10 space-y-2">
            {nativePlatform ? (
              <Smartphone className="w-5 h-5 text-primary mx-auto" />
            ) : (
              <Globe className="w-5 h-5 text-primary mx-auto" />
            )}
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {nativePlatform ? 'Native Shell' : 'Global Access'}
            </p>
          </div>
        </div>

        {/* Login Method Tabs */}
        <div className="flex justify-center space-x-2 bg-surface-container p-1 rounded-3xl">
          <button
            onClick={() => setLoginMethod('email')}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
              loginMethod === 'email' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setLoginMethod('phone')}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
              loginMethod === 'phone' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            Phone
          </button>
          <button
            onClick={() => setLoginMethod('google')}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
              loginMethod === 'google' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
            }`}
          >
            Google
          </button>
        </div>

        {/* Login Forms */}
        <div className="space-y-6">
          {loginMethod === 'email' && (
            <>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-3xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-3xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleEmailLogin}
                disabled={loading || !email || !password}
                className="w-full bg-primary text-on-primary py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </>
          )}

          {loginMethod === 'phone' && (
            <>
              {!confirmationResult ? (
                <>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-3xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={loading || !phone}
                    className="w-full bg-primary text-on-primary py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-4 rounded-3xl border border-outline-variant bg-surface text-center text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || !otp}
                    className="w-full bg-primary text-on-primary py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </>
              )}
            </>
          )}

          {loginMethod === 'google' && (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Login with Google'}
            </button>
          )}

          {error && (
            <p className="text-xs font-bold text-rose-500 bg-rose-500/10 py-3 px-4 rounded-xl border border-rose-500/20">
              {error}
            </p>
          )}

          {/* Switch to Signup */}
          <p className="mt-4 text-primary cursor-pointer font-medium" onClick={onSignupSwitch}>
            Don't have an account? Sign Up
          </p>

          <p className="text-[10px] font-medium text-on-surface-variant/40 leading-relaxed px-8">
            By signing in, you agree to our terms of service and acknowledge our sovereign data protection protocols.
          </p>
        </div>
      </motion.div>
      <div id="recaptcha-container-login"></div>
    </div>
  );
};
