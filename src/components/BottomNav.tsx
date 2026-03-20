import React from 'react';
import { LayoutDashboard, ReceiptIndianRupee, Brain, Landmark, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center transition-all active:scale-90 duration-200 px-4 py-1.5 rounded-2xl",
      active 
        ? "text-primary bg-primary/10" 
        : "text-on-surface-variant opacity-40 hover:text-primary/60"
    )}
  >
    <Icon className={cn("w-6 h-6", active ? "stroke-[2.5px]" : "stroke-2")} />
    <span className="text-[10px] font-black uppercase tracking-widest mt-1.5">{label}</span>
  </button>
);

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav = ({ activeTab, setActiveTab }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 bg-surface/80 backdrop-blur-xl z-50 border-t border-white/5 safe-bottom">
      <NavItem 
        icon={LayoutDashboard} 
        label="Home" 
        active={activeTab === 'home'} 
        onClick={() => setActiveTab('home')} 
      />
      <NavItem 
        icon={ReceiptIndianRupee} 
        label="Expenses" 
        active={activeTab === 'expenses'} 
        onClick={() => setActiveTab('expenses')} 
      />
      <NavItem 
        icon={Brain} 
        label="AI DNA" 
        active={activeTab === 'aidna'} 
        onClick={() => setActiveTab('aidna')} 
      />
      <NavItem 
        icon={MessageSquare} 
        label="Chat" 
        active={activeTab === 'chat'} 
        onClick={() => setActiveTab('chat')} 
      />
      <NavItem 
        icon={Landmark} 
        label="Vault" 
        active={activeTab === 'vault'} 
        onClick={() => setActiveTab('vault')} 
      />
    </nav>
  );
};
