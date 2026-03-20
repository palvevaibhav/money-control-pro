import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0a0b10] flex flex-col items-center justify-center"
    >
      {/* Skip Button */}
      <button 
        onClick={onFinish}
        className="absolute top-12 right-6 border border-white/20 rounded px-2 py-0.5 text-[10px] text-white/60 font-medium uppercase tracking-widest hover:bg-white/5 transition-colors"
      >
        Skip
      </button>

      {/* Central Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-[0_20px_40px_rgba(168,85,247,0.3)]">
          <span className="text-4xl">💰</span>
        </div>
        <div className="absolute inset-0 blur-2xl bg-purple-500/20 -z-10 rounded-full" />
      </motion.div>

      {/* App Name */}
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-[#a855f7] to-[#10b981] bg-clip-text text-transparent">
          Money Control Pro
        </h1>
        <p className="text-xs font-medium text-white/40 tracking-wide">
          Your Financial Operating System
        </p>
      </div>

      {/* Loading Bar Container */}
      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden relative">
        <motion.div 
          className="h-full bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};
