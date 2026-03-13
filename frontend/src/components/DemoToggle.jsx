import React from 'react';
import { useDemoMode } from '../context/DemoContext';
import { Sparkles } from 'lucide-react';

export default function DemoToggle() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <button
      onClick={toggleDemoMode}
      className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2 rounded-full border transition-all shadow-lg ${
        isDemoMode 
          ? 'bg-accent-blue text-white border-accent-blue glow-blue scale-110' 
          : 'bg-bg-glass text-text-secondary border-border-glass hover:bg-bg-glass-hover'
      }`}
    >
      <Sparkles className={`h-4 w-4 ${isDemoMode ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-bold uppercase tracking-widest">
        {isDemoMode ? 'Demo Mode Active' : 'Enter Demo Mode'}
      </span>
    </button>
  );
}
