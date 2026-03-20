import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RefreshCw, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeReceipt } from '../lib/ai';
import { createEntityId, storage } from '../lib/storage';
import { Transaction } from '../types';
import { auth } from '../lib/firebase';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const handleAnalyze = async () => {
    if (!imgSrc) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      if (!auth.currentUser) return;
      const base64Data = imgSrc.split(',')[1];
      const result = await analyzeReceipt(base64Data);

      if (result) {
        const newTx: Transaction = {
          id: createEntityId('tx'),
          uid: auth.currentUser.uid,
          amount: result.amount,
          category: result.category,
          description: result.description,
          date: result.date,
          type: 'expense'
        };
        storage.saveTransaction(newTx);
        onSuccess(newTx);
        onClose();
      } else {
        setError("Could not analyze receipt. Please try again or enter manually.");
      }
    } catch (err) {
      setError("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-lg bg-surface rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
            <h2 className="text-white font-black tracking-tighter text-xl">Scan Receipt</h2>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="aspect-[3/4] relative bg-black flex items-center justify-center">
            {!imgSrc ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'environment' }}
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" />
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="font-black tracking-widest uppercase text-xs">AI Analyzing Receipt...</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-8 bg-surface border-t border-white/5">
            {error && (
              <p className="text-rose-500 text-xs font-bold mb-4 text-center">{error}</p>
            )}

            <div className="flex justify-center items-center gap-6">
              {!imgSrc ? (
                <button 
                  onClick={capture}
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl active:scale-90 transition-transform"
                >
                  <div className="w-16 h-16 rounded-full border-4 border-black/10 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-black" />
                  </div>
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setImgSrc(null)}
                    disabled={isAnalyzing}
                    className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/20 active:scale-90 transition-transform disabled:opacity-50"
                  >
                    <Check className="w-10 h-10 text-black" />
                  </button>
                </>
              )}
            </div>
            
            {!imgSrc && (
              <p className="text-on-surface/40 text-[10px] font-black uppercase tracking-widest text-center mt-6">
                Align receipt within frame
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
