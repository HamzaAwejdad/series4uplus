
import React, { useState, useRef } from 'react';

interface Props {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onAdminAccess: () => void;
}

const Header: React.FC<Props> = ({ onRefresh, isRefreshing, onAdminAccess }) => {
  const [tapCount, setTapCount] = useState(0);
  const timerRef = useRef<number | null>(null);

  const handleLogoTap = () => {
    setTapCount(prev => prev + 1);
    
    if (timerRef.current) window.clearTimeout(timerRef.current);
    
    if (tapCount + 1 >= 5) {
      onAdminAccess();
      setTapCount(0);
    } else {
      timerRef.current = window.setTimeout(() => {
        setTapCount(0);
      }, 2000);
    }
  };

  return (
    <header className="px-4 pt-6 pb-2 flex items-center justify-between relative z-50">
      <div className="flex items-center gap-3">
        <div 
          onClick={handleLogoTap}
          className="w-12 h-12 relative overflow-hidden rounded-xl shadow-xl shadow-red-900/10 border border-white/5 bg-black cursor-pointer active:scale-90 transition-transform"
        >
          <img 
            src="https://ik.imagekit.io/s4uplus/s4u-plus-logo.png" 
            alt="Series4U+ Logo" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-red-700 flex items-center justify-center font-black text-white italic text-xs">4U+</div>';
            }}
          />
        </div>
        <div className="flex flex-col -gap-1">
          <h1 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none">
            Series<span className="text-[#3299FF]">4U</span><span className="text-[#FF2A2A]">+</span>
          </h1>
          <span className="text-[8px] text-gray-500 uppercase tracking-[0.2em] font-bold">Official Bot</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-full transition-all text-white/50 hover:text-white hover:bg-white/5 active:scale-90 ${isRefreshing ? 'opacity-50' : ''}`}
          aria-label="Refresh content"
        >
          <svg 
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;