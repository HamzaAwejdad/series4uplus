
import React, { useState } from 'react';
import { ContentItem } from '../types';
import { showRewardedAd, AdErrorType } from '../services/adService';
import { TELEGRAM_CHANNEL_URL } from '../constants';

interface Props {
  item: ContentItem;
  onClose: () => void;
}

const DetailsModal: React.FC<Props> = ({ item, onClose }) => {
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adError, setAdError] = useState<{msg: string, type: AdErrorType} | null>(null);

  const openLinkSafely = (url: string) => {
    if (!url) return;
    let targetUrl = url.trim();
    
    // Final check for protocol to prevent JS errors
    if (!targetUrl.startsWith('http')) {
      if (targetUrl.startsWith('t.me')) {
        targetUrl = 'https://' + targetUrl;
      } else {
        targetUrl = 'https://t.me/' + targetUrl.replace(/^@/, '');
      }
    }

    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      // openLink is the standard method for opening external URLs or t.me links in Mini Apps
      if (tg.openLink) {
        try {
          tg.openLink(targetUrl);
        } catch (e) {
          window.open(targetUrl, '_blank');
        }
      } else {
        window.open(targetUrl, '_blank');
      }
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  const handleWatchAd = async () => {
    setAdError(null);
    setIsAdLoading(true);
    
    const result = await showRewardedAd();
    setIsAdLoading(false);
    
    if (result.success) {
      setIsUnlocked(true);
    } else {
      setAdError({ 
        msg: result.error || "Failed to initiate advertisement.", 
        type: result.errorType || 'UNKNOWN' 
      });
    }
  };

  const handleFinalRedirect = () => {
    openLinkSafely(item.telegramLink);
  };

  const handleJoin = () => {
    openLinkSafely(TELEGRAM_CHANNEL_URL);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full aspect-video sm:aspect-auto sm:h-[40vh]">
        <img 
          src={item.poster} 
          alt={item.title} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <img src="https://ik.imagekit.io/s4uplus/s4u-plus-logo.png" className="w-6 h-6 object-contain rounded" alt="Branding" />
          <span className="text-[10px] font-black tracking-tight text-white uppercase italic">
            Series<span className="text-[#3299FF]">4U</span><span className="text-[#FF2A2A]">+</span>
          </span>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-md hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-6 -mt-16 relative z-10 pb-12 max-w-2xl mx-auto w-full">
        <h1 className="text-4xl font-black text-white mb-2 leading-tight drop-shadow-2xl">{item.title}</h1>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-6">
          <span className="text-green-500 font-bold">⭐ {item.rating}</span>
          <span>{item.year}</span>
          <span className="px-2 py-0.5 border border-gray-600 rounded text-[10px] uppercase tracking-wider">{item.type}</span>
          <span className="text-gray-500">|</span>
          <span>{item.category}</span>
          {item.seasons && <span className="text-red-500 font-bold">{item.seasons} Seasons</span>}
        </div>

        {adError && (
          <div className="mb-6 p-5 bg-red-950/40 border border-red-800/50 rounded-2xl text-center animate-in zoom-in-95 duration-200 shadow-[0_0_30px_rgba(185,28,28,0.15)]">
            <div className="flex items-center justify-center gap-2 mb-2">
               <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <p className="text-red-300 text-xs font-black uppercase tracking-wider">
                 {adError.type === 'BLOCKER' ? 'System Blocked' : 'Notice'}
               </p>
            </div>
            <p className="text-red-100/80 text-sm leading-snug">{adError.msg}</p>
            <div className="flex justify-center gap-4 mt-4">
              <button 
                onClick={handleWatchAd}
                className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-all border border-white/10"
              >
                Retry Unlock
              </button>
            </div>
          </div>
        )}

        <p className="text-gray-400 text-sm leading-relaxed mb-10 font-light">
          {item.description}
        </p>

        {!isUnlocked ? (
          <button 
            onClick={handleWatchAd}
            disabled={isAdLoading}
            className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 mb-10 transition-transform active:scale-95 shadow-xl disabled:opacity-50"
          >
            {isAdLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                LOADING AD...
              </span>
            ) : (
              'WATCH AD TO UNLOCK'
            )}
          </button>
        ) : (
          <button 
            onClick={handleFinalRedirect}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-xl flex items-center justify-center gap-3 mb-10 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(255,42,42,0.3)] animate-in zoom-in duration-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
            WATCH ON TELEGRAM
          </button>
        )}

        <div className="p-8 bg-gradient-to-br from-[#0A0A0A] to-[#151515] rounded-3xl border border-white/5 text-center shadow-2xl overflow-hidden relative group">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-all duration-1000" />
          
          <div className="w-20 h-20 relative mx-auto mb-4">
            <img src="https://ik.imagekit.io/s4uplus/s4u-plus-logo.png" className="w-full h-full object-contain drop-shadow-xl rounded-xl" alt="Logo" />
          </div>
          
          <h4 className="text-white font-black text-lg mb-1 tracking-tight">JOIN THE COMMUNITY</h4>
          <p className="text-xs text-gray-500 mb-6">Stay updated with latest releases & direct links</p>
          <button 
            onClick={handleJoin}
            className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]"
          >
            Series4Uplus Official Channel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;