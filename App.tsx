
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ContentItem, ContentType, SheetRow } from './types';
import { CATEGORIES, GOOGLE_SHEET_ID } from './constants';
import { fetchContentMetadata } from './services/geminiService';
import { fetchSheetData } from './services/googleSheetsService';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ContentCard from './components/ContentCard';
import DetailsModal from './components/DetailsModal';
import AdminDashboard from './components/AdminDashboard';
import SkeletonCard from './components/SkeletonCard';

const App: React.FC = () => {
  const [catalog, setCatalog] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<ContentType>('series');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing Archive...');
  
  const generateSafeId = (title: string, year: string) => {
    // Robust ID generation for non-ASCII titles
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `${safeTitle}-${year}-${Math.random().toString(36).substring(2, 6)}`;
  };

  const syncData = useCallback(async () => {
    setIsSyncing(true);
    try {
      setStatusMessage('Scanning Database...');
      const sheetRows = await fetchSheetData();
      
      const newCatalog: ContentItem[] = sheetRows.map(row => ({
        id: generateSafeId(row.title, row.year),
        title: row.title,
        type: row.type,
        year: row.year || "2024",
        rating: row.rating || "N/A",
        category: row.genres || "General",
        description: row.description || "Loading cinematic briefing...",
        poster: row.poster || `https://images.placeholders.dev/?width=400&height=600&text=${encodeURIComponent(row.title)}&bg=%23111&color=%23555`,
        telegramLink: row.telegram,
        status: 'active'
      }));

      setCatalog(newCatalog);
    } catch (err) {
      console.error("[App] Sync failure:", err);
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncData();
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.ready();
    }
  }, [syncData]);

  const handleAddNewFromSearch = async (name: string) => {
    if (isSyncing || !name) return;
    setIsSyncing(true);
    setStatusMessage(`Scanning Global Archive: ${name}...`);
    
    try {
      const mockRow: SheetRow = { 
        title: name, 
        type: activeTab, 
        telegram: 'https://t.me/Series4UplusOfficial',
        year: '', rating: '', genres: '', description: '', poster: ''
      };
      
      const newItem = await fetchContentMetadata(mockRow);
      if (newItem && !newItem.id.startsWith('error-')) {
        setCatalog(prev => [newItem, ...prev]);
        setSelectedItem(newItem);
      } else {
        alert("This title is currently obscured. Try a different search.");
      }
    } catch (e) {
      console.error("Auto-fetch failed", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredItems = useMemo(() => {
    return catalog.filter(item => {
      const matchesTab = item.type === activeTab;
      const matchesCategory = activeCategory === 'All' || item.category.toLowerCase().includes(activeCategory.toLowerCase());
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesCategory && matchesSearch;
    });
  }, [catalog, activeTab, activeCategory, searchQuery]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    return catalog.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [catalog, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-700/30">
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-2xl animate-pulse" />
            <img src="https://ik.imagekit.io/s4uplus/s4u-plus-logo.png" className="w-32 h-32 object-contain relative z-10 animate-pulse" alt="Loading" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black animate-pulse">{statusMessage}</p>
        </div>
      )}

      <Header onRefresh={syncData} isRefreshing={isSyncing} onAdminAccess={() => setIsAdminOpen(true)} />
      
      <SearchBar 
        onSearch={setSearchQuery} 
        suggestions={searchSuggestions}
        onSelectSuggestion={setSelectedItem}
        onAddNew={handleAddNewFromSearch} 
      />

      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md pt-4 pb-2 px-4 border-b border-white/5">
        <div className="flex gap-4 mb-4">
          {(['series', 'movie'] as ContentType[]).map(type => (
            <button key={type} onClick={() => setActiveTab(type)} className={`text-sm font-black transition-all px-2 py-1 capitalize tracking-tight ${activeTab === type ? 'text-white border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-300'}`}>
              {type === 'series' ? 'Series' : 'Movies'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${activeCategory === cat ? 'bg-red-700 text-white shadow-lg shadow-red-900/20' : 'bg-[#111] text-gray-500 hover:bg-[#1a1a1a]'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => <ContentCard key={item.id} item={item} onClick={setSelectedItem} />)
        ) : searchQuery && !isSyncing ? (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Archive Result Empty</p>
             <button 
              onClick={() => handleAddNewFromSearch(searchQuery)}
              className="px-6 py-2 bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg"
             >
               Auto-Fetch: {searchQuery}
             </button>
          </div>
        ) : (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        )}
      </div>

      <footer className="py-20 text-center opacity-20">
         <p className="text-[8px] uppercase tracking-[0.6em] font-black">Series4Uplus Cinematic Bot</p>
      </footer>

      {selectedItem && <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {isAdminOpen && <AdminDashboard catalog={catalog} onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
};

export default App;