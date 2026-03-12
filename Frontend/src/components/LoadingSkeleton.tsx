import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Hero Band Skeleton */}
      <div className="rounded-2xl bg-surface-card border border-surface-border/80 px-6 py-5 flex justify-between items-center card-glow">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-surface-elevated rounded-lg shimmer" />
            <div className="h-7 w-52 bg-surface-elevated rounded-lg shimmer" />
          </div>
          <div className="h-3 w-44 bg-surface-elevated rounded ml-[42px] shimmer" />
        </div>
        <div className="h-8 w-24 bg-blue-600/20 rounded-lg shimmer" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-card border border-surface-border/80 rounded-xl p-5 card-glow overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-surface-elevated shimmer" />
            <div className="flex justify-between mb-3">
              <div className="h-2.5 w-24 bg-surface-elevated rounded shimmer" />
              <div className="h-8 w-8 bg-surface-elevated rounded-lg shimmer" />
            </div>
            <div className="h-7 w-32 bg-surface-elevated rounded mb-1.5 shimmer" />
            <div className="h-2.5 w-20 bg-surface-elevated rounded shimmer" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-surface-card border border-surface-border/80 rounded-xl p-5 card-glow">
            <div className="flex justify-between items-center mb-4">
              <div className="h-2.5 w-32 bg-surface-elevated rounded shimmer" />
              <div className="h-2.5 w-14 bg-surface-elevated rounded shimmer" />
            </div>
            <div className="h-[280px] bg-surface-elevated/40 rounded-lg shimmer" />
          </div>
        ))}
      </div>

      {/* Table Skeletons */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden">
          <div className="h-14 bg-surface-card border border-surface-border rounded-t-xl border-l-[3px] border-l-blue-500/30 flex items-center px-5 gap-3">
            <div className="w-8 h-8 bg-surface-elevated rounded-md shimmer" />
            <div>
              <div className="h-3.5 w-28 bg-surface-elevated rounded mb-1.5 shimmer" />
              <div className="h-2.5 w-16 bg-surface-elevated rounded shimmer" />
            </div>
          </div>
          <div className="border border-t-0 border-surface-border rounded-b-xl overflow-hidden">
            <div className="h-9 bg-[#080d18] border-b border-surface-border/70 flex items-center px-4 gap-4">
              {[...Array(7)].map((_, k) => (
                <div key={k} className="h-2 w-14 bg-surface-elevated rounded shimmer" />
              ))}
            </div>
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-12 bg-surface-card border-b border-surface-border/35 flex items-center px-4 gap-3">
                <div className="w-7 h-7 bg-surface-elevated rounded-md shimmer flex-shrink-0" />
                <div className="h-3.5 w-28 bg-surface-elevated rounded shimmer" />
                <div className="flex-1" />
                {[...Array(5)].map((_, k) => (
                  <div key={k} className={`h-3 bg-surface-elevated rounded shimmer ${k % 2 === 0 ? 'w-16' : 'w-20'}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
