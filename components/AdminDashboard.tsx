
import React, { useState } from 'react';
import { ContentItem, SheetRow } from '../types';
import { GOOGLE_SHEET_ID } from '../constants';
import { fetchContentMetadata } from '../services/geminiService';

interface Props {
  catalog: ContentItem[];
  onClose: () => void;
}

const AdminDashboard: React.FC<Props> = ({ catalog, onClose }) => {
  const [formData, setFormData] = useState<SheetRow>({
    title: '',
    type: 'movie',
    year: '',
    rating: '',
    genres: '',
    description: '',
    telegram: '',
    poster: ''
  });
  const [isAutoFetching, setIsAutoFetching] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateRow = () => {
    const { title, type, year, rating, genres, description, telegram, poster } = formData;
    // Format: Title, Type, Year, Rating, Genres, Description, Telegram, Poster
    // We escape double quotes within values to keep CSV format valid
    const esc = (v: string) => v.replace(/"/g, '""');
    return `"${esc(title)}", "${esc(type)}", "${esc(year)}", "${esc(rating)}", "${esc(genres)}", "${esc(description)}", "${esc(telegram)}", "${esc(poster)}"`;
  };

  const handleMagicFill = async () => {
    if (!formData.title) return;
    setIsAutoFetching(true);
    try {
      const data = await fetchContentMetadata(formData);
      if (data && !data.id.startsWith('error-')) {
        setFormData(prev => ({
          ...prev,
          year: data.year,
          rating: data.rating,
          genres: data.category,
          description: data.description,
          poster: data.poster
        }));
      }
    } catch (e) {
      console.error("Magic fill failed", e);
    } finally {
      setIsAutoFetching(false);
    }
  };

  const handleCopy = () => {
    if (!formData.title) return;
    navigator.clipboard.writeText(generateRow());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-y-auto pb-10">
      <div className="bg-[#111] p-6 sticky top-0 border-b border-white/5 flex items-center justify-between shadow-2xl">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">System Dashboard</h2>
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Database Manager</p>
        </div>
        <button 
          onClick={onClose} 
          className="bg-white/5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        <div className="flex gap-3">
          <button 
            onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`, '_blank')} 
            className="flex-1 py-4 bg-green-700 hover:bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Live Sheet
          </button>
        </div>

        <div className="bg-[#0A0A0A] p-6 rounded-3xl border border-white/5 space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-700 to-red-900" />
          <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest">Entry Preparation</h3>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2">
               <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Title (Column A)</label>
               <div className="flex gap-2">
                 <input 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-red-700 outline-none transition-all" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Deadpool & Wolverine"
                 />
                 <button 
                  onClick={handleMagicFill}
                  disabled={isAutoFetching || !formData.title}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl text-xs font-bold disabled:opacity-30 transition-all flex items-center justify-center"
                  title="Magic Fill with Gemini AI"
                 >
                   {isAutoFetching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✨'}
                 </button>
               </div>
             </div>

             <div>
               <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Type (Column B)</label>
               <select 
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-red-700 outline-none" 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value as any})}
               >
                 <option value="movie">Movie</option>
                 <option value="series">Series</option>
               </select>
             </div>

             <div>
               <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Year (Column C)</label>
               <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-red-700 outline-none" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="2024" />
             </div>

             <div>
               <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Rating (Column D)</label>
               <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-red-700 outline-none" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} placeholder="8.5" />
             </div>

             <div>
               <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Genres (Column E)</label>
               <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-red-700 outline-none" value={formData.genres} onChange={e => setFormData({...formData, genres: e.target.value})} placeholder="Action, Sci-Fi" />
             </div>

             <div className="col-span-2">
               <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Description (Column F)</label>
               <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-24 resize-none focus:border-red-700 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Movie plot summary..." />
             </div>

             <div className="col-span-2">
               <label className="text-[10px] text-red-500 uppercase font-bold ml-1 italic">Telegram Channel Link (Column G)</label>
               <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-red-700 outline-none font-mono text-red-100" value={formData.telegram} onChange={e => setFormData({...formData, telegram: e.target.value})} placeholder="t.me/ExampleChannel" />
             </div>

             <div className="col-span-2">
               <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Poster URL (Column H)</label>
               <input className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-red-700 outline-none" value={formData.poster} onChange={e => setFormData({...formData, poster: e.target.value})} placeholder="https://..." />
             </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
            <button 
              onClick={handleCopy} 
              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${copied ? 'bg-green-600 text-white' : 'bg-white text-black active:scale-[0.98]'}`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  COPIED! PASTE TO SHEET
                </>
              ) : (
                'GENERATE & COPY ROW'
              )}
            </button>
            <p className="text-[9px] text-center text-gray-600 leading-relaxed px-4">
              Click the button, then go to your Google Sheet and paste into column A of a new row.
            </p>
          </div>
        </div>

        {/* Catalog Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest">Recent Archive</h3>
            <span className="text-[10px] bg-red-900/20 text-red-500 px-2 py-0.5 rounded font-bold">{catalog.length} ITEMS</span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar rounded-xl">
            {catalog.slice(0, 10).map(item => (
              <div key={item.id} className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 flex items-center justify-between group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={item.poster} className="w-8 h-12 object-cover rounded shadow-lg group-hover:scale-110 transition-transform" alt="" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate w-40">{item.title}</p>
                    <p className="text-[9px] text-gray-500 uppercase font-black">{item.type} • {item.year}</p>
                  </div>
                </div>
                <div className="text-[8px] bg-white/5 text-gray-400 px-2 py-1 rounded font-black uppercase">
                  Stored
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
