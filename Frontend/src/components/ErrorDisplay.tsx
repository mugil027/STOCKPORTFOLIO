import React from 'react';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="flex items-center justify-center py-24 animate-fade-in">
      <div className="bg-surface-card border border-red-500/20 rounded-2xl p-12 card-glow max-w-md w-full mx-auto text-center">
        <p className="stat-label text-red-500/60 mb-4">System Error</p>

        <div className="w-14 h-14 rounded-full bg-red-500/8 border border-red-500/25 flex items-center justify-center mb-5 mx-auto">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h3 className="text-base font-semibold text-slate-100 tracking-wide mb-2">Failed to Load Portfolio</h3>
        <p className="text-xs text-slate-500 font-mono leading-relaxed mb-7 max-w-xs mx-auto">{message}</p>

        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-all duration-200 shadow-lg shadow-blue-900/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-500/30"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
