import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Settings, 
  Plus, 
  Mic, 
  Send, 
  Shield, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  X,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { formatDualCurrency } from '../lib/currency';
import { chatWithAI } from '../lib/ai';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
  files?: { name: string; type: string; data: string }[];
  data?: {
    label: string;
    value: string;
    trend?: 'up' | 'down';
  }[];
}

export const SovereignAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Welcome to the Vault, Commander. Your financial neural net is synchronized. How shall we architect your portfolio today?',
      timestamp: '09:41 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; type: string; data: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedFiles(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: base64.split(',')[1]
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && selectedFiles.length === 0) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentFiles = [...selectedFiles];
    setInput('');
    setSelectedFiles([]);
    setIsThinking(true);

    try {
      const aiResponse = await chatWithAI(
        currentInput || "Analyze the attached files.",
        currentFiles.map(f => ({ mimeType: f.type, data: f.data }))
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponse || "I couldn't process that request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-surface relative">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="https://picsum.photos/seed/ai/100/100" 
              alt="AI Avatar" 
              className="w-10 h-10 rounded-full border border-primary/20"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-surface"></div>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-on-surface">Sovereign AI</h2>
            <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-on-surface/40">
              <Shield className="w-2 h-2 text-primary" />
              ENCRYPTION ACTIVE
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-on-surface/60 hover:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-on-surface/60 hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-lg",
                msg.role === 'user' 
                  ? "bg-primary text-black rounded-tr-none" 
                  : "bg-surface-container text-on-surface rounded-tl-none border border-white/5"
              )}>
                {msg.files && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {msg.files.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 bg-black/10 p-2 rounded-lg border border-white/5">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        <span className="text-[10px] font-bold truncate max-w-[100px]">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                
                {msg.data && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {msg.data.map((item, i) => (
                      <div key={i} className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-on-surface/40 mb-1">{item.label}</p>
                        <p className={cn(
                          "text-base font-black tracking-tighter leading-none",
                          item.trend === 'up' ? "text-primary" : "text-rose-500"
                        )}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[9px] font-black text-on-surface/30 mt-2 uppercase tracking-widest">
                {msg.timestamp}
              </span>
            </motion.div>
          ))}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start max-w-[85%] mr-auto"
            >
              <div className="bg-surface-container p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Alert Banner (Optional, matching image bottom) */}
      <div className="px-4 py-2">
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Transaction Ready</span>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface/80 backdrop-blur-md border-t border-white/5">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedFiles.map((file, i) => (
              <div key={i} className="relative group">
                <div className="flex items-center gap-2 bg-surface-container p-2 rounded-xl border border-white/5 pr-8">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-primary" />
                  ) : (
                    <FileText className="w-4 h-4 text-primary" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(i)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-rose-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form 
          onSubmit={handleSend}
          className="flex items-center gap-3"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <div className="flex-1 bg-surface-container rounded-2xl flex items-center px-4 py-3 border border-white/5 focus-within:border-primary/50 transition-colors">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="text-on-surface/40 hover:text-primary transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Command the Vault"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-on-surface placeholder:text-on-surface/20 px-3"
            />
            <button type="button" className="text-on-surface/40 hover:text-primary transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <button 
            type="submit"
            className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};
