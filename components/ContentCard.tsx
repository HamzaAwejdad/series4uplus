
import React from 'react';
import { ContentItem } from '../types';

interface Props {
  item: ContentItem;
  onClick: (item: ContentItem) => void;
}

const ContentCard: React.FC<Props> = ({ item, onClick }) => {
  return (
    <div 
      onClick={() => onClick(item)}
      className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#0A0A0A] group cursor-pointer card-transition shadow-lg border border-white/5"
    >
      <img 
        src={item.poster} 
        alt={item.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 netflix-gradient opacity-90" />
      <div className="absolute bottom-0 left-0 p-3 w-full">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-700 text-white uppercase tracking-tighter">
            {item.type}
          </span>
          <span className="text-[10px] text-gray-400 font-bold">
            {item.year}
          </span>
        </div>
        <h3 className="text-xs font-black truncate leading-tight text-white/90">{item.title}</h3>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-500 text-[10px] font-bold">⭐ {item.rating}</span>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
