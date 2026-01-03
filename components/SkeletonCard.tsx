import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#111] border border-white/5">
      {/* Poster shimmer */}
      <div className="w-full h-full animate-shimmer" />
      
      <div className="absolute bottom-0 left-0 p-2 w-full space-y-2">
        <div className="flex items-center gap-1 mb-1">
          {/* Tag shimmer */}
          <div className="w-10 h-3 rounded bg-white/5 animate-pulse" />
          {/* Year shimmer */}
          <div className="w-6 h-3 rounded bg-white/5 animate-pulse" />
        </div>
        {/* Title shimmer */}
        <div className="w-3/4 h-4 rounded bg-white/5 animate-pulse" />
        {/* Rating shimmer */}
        <div className="w-1/4 h-3 rounded bg-white/5 animate-pulse" />
      </div>
    </div>
  );
};

export default SkeletonCard;