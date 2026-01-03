
import React, { useState, useEffect, useRef } from 'react';
import { ContentItem } from '../types';

interface Props {
  onSearch: (query: string) => void;
  suggestions: ContentItem[];
  onSelectSuggestion: (item: ContentItem) => void;
  onAddNew: (name: string) => void;
}

const SearchBar: React.FC<Props> = ({ onSearch, suggestions, onSelectSuggestion, onAddNew }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSearch(query);
    setIsOpen(query.length > 0);
  }, [query, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-lg mx-auto px-4 mt-4 z-40">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies or series..."
          className="w-full bg-[#1A1A1A] text-white pl-12 pr-4 py-3 rounded-full border border-white/10 focus:border-red-700 focus:outline-none focus:ring-1 focus:ring-red-700 transition-all text-sm"
        />
        <svg 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="max-h-80 overflow-y-auto">
            {suggestions.length > 0 ? (
              suggestions.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    onSelectSuggestion(item);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5"
                >
                  <img src={item.poster} className="w-10 h-14 object-cover rounded shadow" alt={item.title} />
                  <div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.type} • {item.year}</p>
                  </div>
                </div>
              ))
            ) : (
              <div 
                className="p-4 text-center cursor-pointer hover:bg-white/5"
                onClick={() => {
                  onAddNew(query);
                  setQuery('');
                  setIsOpen(false);
                }}
              >
                <p className="text-sm text-gray-400">Not found in catalog?</p>
                <p className="text-xs text-red-500 font-bold mt-1 uppercase">Click to Auto-Fetch: "{query}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
